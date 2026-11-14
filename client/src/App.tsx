import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { levels } from '@queryquest/shared'
import { levelArcId } from './data/arcs.ts'
import { getUser, bootstrapAuth, syncSupabaseSession, supabase } from './lib/auth.ts'
import { hasCompletedOnboarding } from './lib/storage.ts'
import { useSqlEngine } from './hooks/useSqlEngine.ts'
import { useGameState } from './hooks/useGameState.ts'
import { HUD } from './components/HUD.tsx'
import { LandingPage } from './components/LandingPage.tsx'
import { AuthScreen } from './components/AuthScreen.tsx'
import { ResetPasswordScreen } from './components/ResetPasswordScreen.tsx'
import { OnboardingScreen } from './components/OnboardingScreen.tsx'
import { ConsentBanner, TrackingToggle } from './components/ConsentBanner.tsx'
import { LevelSelect } from './components/LevelSelect.tsx'
import { GameScreen } from './components/GameScreen.tsx'
import { SettingsScreen } from './components/SettingsScreen.tsx'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(() => getUser())
  const onboarded = hasCompletedOnboarding()

  // Restore the session on load (including email-confirmation and recovery
  // links) and keep the cached tokens in sync with Supabase's auto-refresh.
  useEffect(() => {
    let active = true
    bootstrapAuth().then(next => { if (active) setUser(next) })

    const { data: sub } = supabase!.auth.onAuthStateChange((event: string, session: import('@supabase/supabase-js').Session | null) => {
      if (event === 'SIGNED_OUT') setUser(null)
      else if (session) syncSupabaseSession(session)
    })

    const onExpired = () => {
      setUser(null)
      navigate('/', { replace: true })
    }
    window.addEventListener('qq:session-expired', onExpired)

    return () => {
      active = false
      sub.subscription.unsubscribe()
      window.removeEventListener('qq:session-expired', onExpired)
    }
  }, [navigate])

  const sqlEngine = useSqlEngine()
  const gameState = useGameState()

  const showHud = useMemo(() => {
    return location.pathname.startsWith('/levels')
      || location.pathname.startsWith('/level/')
      || location.pathname.startsWith('/settings')
  }, [location.pathname])

  const currentLevelId = useMemo(() => {
    const match = location.pathname.match(/^\/level\/(\d+)/)
    return match ? Number(match[1]) : null
  }, [location.pathname])

  return (
    <div>
      {showHud && (
        <HUD
          showBack={location.pathname.startsWith('/level/')}
          onOpenSettings={() => navigate('/settings')}
          onBack={() => navigate(
            currentLevelId !== null ? `/levels#arc-${levelArcId(currentLevelId)}` : '/levels'
          )}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            user
              ? <Navigate to={onboarded ? '/levels' : '/onboarding'} replace />
              : <LandingPage onStartMission={() => navigate('/auth')} />
          }
        />
        <Route
          path="/auth"
          element={
            user
              ? <Navigate to={onboarded ? '/levels' : '/onboarding'} replace />
              : (
                <AuthScreen
                  onAuth={() => { setUser(getUser()); navigate('/onboarding') }}
                  onBack={() => navigate('/')}
                />
              )
          }
        />
        <Route
          path="/onboarding"
          element={
            !user
              ? <Navigate to="/" replace />
              : onboarded
                ? <Navigate to="/levels" replace />
                : <OnboardingScreen onComplete={() => navigate('/levels')} />
          }
        />
        <Route
          path="/levels"
          element={
            !user
              ? <Navigate to="/" replace />
              : !onboarded
                ? <Navigate to="/onboarding" replace />
                : <LevelSelect
                    levels={levels}
                    completedLevels={gameState.completedLevels}
                    arcAccess={user.arcAccess}
                    todayCount={gameState.todayCount}
                    onSelect={id => navigate(`/level/${id}`)}
                    onOpenSettings={() => navigate('/settings')}
                  />
          }
        />
        <Route
          path="/settings"
          element={
            !user
              ? <Navigate to="/" replace />
              : !onboarded
                ? <Navigate to="/onboarding" replace />
                : <SettingsScreen
                    onBack={() => navigate('/levels')}
                    onSignedOut={() => { setUser(null); navigate('/', { replace: true }) }}
                    privacySlot={<TrackingToggle />}
                  />
          }
        />
        <Route
          path="/level/:id"
          element={
            !user
              ? <Navigate to="/" replace />
              : !onboarded
                ? <Navigate to="/onboarding" replace />
                : (
                  <LevelRoute
                    sqlEngine={sqlEngine}
                    completedLevels={gameState.completedLevels}
                    arcAccess={user.arcAccess}
                    onComplete={gameState.completeLevel}
                  />
                )
          }
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordScreen onDone={() => navigate('/auth')} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Consent must resolve before any telemetry is meaningful. */}
      <ConsentBanner />
    </div>
  )
}

function LevelRoute({
  sqlEngine,
  completedLevels,
  arcAccess,
  onComplete,
}: {
  sqlEngine: ReturnType<typeof useSqlEngine>
  completedLevels: number[]
  arcAccess: number[]
  onComplete: (levelId: number, xpReward: number) => void
}) {
  const navigate = useNavigate()
  const { id } = useParams()
  const levelId = Number(id)
  const level = levels.find(l => l.id === levelId)

  if (!level) {
    return <Navigate to="/levels" replace />
  }

  // Mirror the server's access rules so a pasted URL can't read a mission the
  // player hasn't unlocked yet. The server still enforces this; this just
  // avoids showing the story and task of a locked level.
  const index = levels.findIndex(l => l.id === levelId)
  const arcUnlocked = arcAccess.includes(levelArcId(levelId))
  const sequenceUnlocked = index <= 0 || completedLevels.includes(levels[index - 1].id)

  if (!arcUnlocked || !sequenceUnlocked) {
    return <Navigate to={`/levels#arc-${levelArcId(levelId)}`} replace />
  }

  function handleContinue() {
    const nextLevel = levels.find(l => l.id === levelId + 1)
    if (nextLevel) {
      navigate(`/level/${nextLevel.id}`)
    } else {
      navigate(`/levels#arc-${levelArcId(levelId)}`)
    }
  }

  return (
    <GameScreen
      level={level}
      sqlEngine={sqlEngine}
      completedLevels={completedLevels}
      onComplete={onComplete}
      onContinue={handleContinue}
    />
  )
}

export default App
