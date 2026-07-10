import { useMemo } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { levels } from '@queryquest/shared'
import { levelArcId } from './data/arcs.ts'
import { getUser } from './lib/auth.ts'
import { hasCompletedOnboarding } from './lib/storage.ts'
import { useSqlEngine } from './hooks/useSqlEngine.ts'
import { useGameState } from './hooks/useGameState.ts'
import { HUD } from './components/HUD.tsx'
import { LandingPage } from './components/LandingPage.tsx'
import { AuthScreen } from './components/AuthScreen.tsx'
import { ResetPasswordScreen } from './components/ResetPasswordScreen.tsx'
import { OnboardingScreen } from './components/OnboardingScreen.tsx'
import { LevelSelect } from './components/LevelSelect.tsx'
import { GameScreen } from './components/GameScreen.tsx'
import { SettingsScreen } from './components/SettingsScreen.tsx'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()
  const onboarded = hasCompletedOnboarding()

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
          xp={gameState.xp}
          streak={gameState.streak}
          playedDates={gameState.playedDates}
          completedLevels={gameState.completedLevels}
          levels={levels}
          showBack={location.pathname.startsWith('/level/')}
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
                  onAuth={() => navigate('/onboarding')}
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
                : (
                  <LevelSelect
                    levels={levels}
                    completedLevels={gameState.completedLevels}
                    arcAccess={user.arcAccess}
                    onSelect={id => navigate(`/level/${id}`)}
                    onOpenSettings={() => navigate('/settings')}
                  />
                )
          }
        />
        <Route
          path="/settings"
          element={
            !user
              ? <Navigate to="/" replace />
              : !onboarded
                ? <Navigate to="/onboarding" replace />
                : <SettingsScreen onBack={() => navigate('/levels')} />
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
    </div>
  )
}

function LevelRoute({
  sqlEngine,
  completedLevels,
  onComplete,
}: {
  sqlEngine: ReturnType<typeof useSqlEngine>
  completedLevels: number[]
  onComplete: (levelId: number, xpReward: number) => void
}) {
  const navigate = useNavigate()
  const { id } = useParams()
  const levelId = Number(id)
  const level = levels.find(l => l.id === levelId)

  if (!level) {
    return <Navigate to="/levels" replace />
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
