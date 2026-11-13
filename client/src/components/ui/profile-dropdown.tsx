"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Profile Dropdown - inspired by KokonutUI
 * Accessible, animated dropdown with avatar, user info, and actions
 */

interface User {
  name: string
  email: string
  avatar?: string
  identity?: string
  tempo?: string
  xp?: number
  streak?: number
  role?: "user" | "admin"
}

interface DropdownItem {
  label?: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  dangerous?: boolean
  shortcut?: string
  divider?: boolean
}

interface ProfileDropdownProps {
  user: User
  items?: DropdownItem[]
  align?: "left" | "right"
  className?: string
  onSignOut?: () => void
  onSettings?: () => void
}

export function ProfileDropdown({
  user,
  items = [],
  align = "right",
  className,
  onSignOut,
  onSettings,
}: ProfileDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMounted(true)
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
      buttonRef.current?.focus()
    }
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault()
      setOpen(true)
    }
  }

  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const identityLabels: Record<string, string> = {
    rookie: "Rookie Analyst",
    engineer: "Field Engineer",
    agent: "Returning Agent",
  }

  const tempoLabels: Record<string, string> = {
    scout: "Scout",
    agent: "Agent",
    elite: "Elite",
  }

  const defaultItems: DropdownItem[] = [
    {
      label: "Settings",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => { setOpen(false); onSettings?.() },
      shortcut: "⌘,"
    },
    {
      label: "Profile",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => { setOpen(false) },
    },
    {
      label: "Documentation",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      onClick: () => { setOpen(false); window.open("/docs", "_blank") },
      shortcut: "⌘?"
    },
    { divider: true },
    {
      label: "Sign Out",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: () => { setOpen(false); onSignOut?.() },
      dangerous: true,
    }
  ]

  const allItems = [...defaultItems, ...items]

  return (
    <div
      ref={dropdownRef}
      className={cn("relative inline-block", className)}
    >
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "group relative flex items-center gap-3 rounded-xl",
          "border border-white/10 bg-white/5",
          "px-3 py-2 pr-8",
          "hover:border-cyan-400/50 hover:bg-white/10",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
        )}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${user.name}'s menu`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-8 h-8 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-cyan-300">{initials}</span>
          </div>
        )}
        
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-white truncate max-w-[160px]">
            {user.name}
          </p>
          <p className="text-xs text-white/50 truncate max-w-[160px]">
            {identityLabels[user.identity ?? "rookie"]} · {tempoLabels[user.tempo ?? "agent"]}
          </p>
        </div>

        <svg
          className={cn(
            "w-4 h-4 text-white/50 transition-transform duration-200",
            "absolute right-3",
            open && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {mounted && open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpen(false)} />
          
          <div
            className={cn(
              "fixed z-50 mt-2 w-72 origin-top-right rounded-2xl",
              "border border-white/10 bg-[#050814]/95",
              "backdrop-blur-xl shadow-2xl",
              "overflow-hidden animate-dropdown-in",
              "ring-1 ring-white/5",
              align === "right" ? "right-0" : "left-0"
            )}
            style={{
              animation: "dropdown-in 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
            role="menu"
            aria-orientation="vertical"
          >
            <style>{`
              @keyframes dropdown-in {
                from {
                  opacity: 0;
                  transform: translateY(-8px) scale(0.96);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>

            {/* User Header */}
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center">
                    <span className="text-sm font-mono font-bold text-cyan-300">{initials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
              </div>

              {/* XP/Streak Bar */}
              {user.xp !== undefined || user.streak !== undefined ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {user.xp !== undefined && (
                    <div className="rounded-lg bg-white/5 p-2 text-center">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">XP</p>
                      <p className="text-lg font-mono font-bold text-purple-300">
                        {user.xp.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {user.streak !== undefined && (
                    <div className="rounded-lg bg-white/5 p-2 text-center">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Streak</p>
                      <p className="text-lg font-mono font-bold text-yellow-300 flex items-center justify-center gap-1">
                        🔥 {user.streak}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider",
                  "border",
                  user.identity === "agent" && "border-purple-400/50 text-purple-300 bg-purple-400/10",
                  user.identity === "engineer" && "border-cyan-400/50 text-cyan-300 bg-cyan-400/10",
                  user.identity === "rookie" && "border-green-400/50 text-green-300 bg-green-400/10"
                )}>
                  {identityLabels[user.identity ?? "rookie"]}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider",
                  "border border-white/10 text-white/60 bg-white/5"
                )}>
                  {tempoLabels[user.tempo ?? "agent"]}
                </span>
                {user.role === "admin" && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider",
                    "border border-red-400/50 text-red-300 bg-red-400/10 animate-pulse"
                  )}>
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {allItems.map((item, index) => {
                if (item.divider) {
                  return (
                    <div key={`divider-${index}`} className="my-2 border-t border-white/5" role="separator" />
                  )
                }
                return (
                  <button
                    key={index}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    disabled={item.disabled}
                    onClick={item.onClick}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5",
                      "text-sm text-white/90",
                      "hover:bg-white/5 transition-colors",
                      "disabled:opacity-40 disabled:pointer-events-none",
                      item.dangerous && "text-red-400 hover:bg-red-400/10"
                    )}
                  >
                    <span className="w-4 h-4 flex-shrink-0 text-white/50 group-hover:text-white/80">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-white/30 px-2 py-0.5 rounded bg-white/5">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Compact Avatar - for HUD/top bar
 */
interface CompactAvatarProps {
  user: User
  size?: "sm" | "md" | "lg"
  showName?: boolean
  onClick?: () => void
}

export function CompactAvatar({ user, size = "md", showName = true, onClick }: CompactAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base"
  }

  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-xl",
        "border border-white/10 bg-white/5",
        "px-2 py-1.5 pr-3",
        "hover:border-cyan-400/50 hover:bg-white/10",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
        onClick && "cursor-pointer"
      )}
      aria-label={user.name}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt=""
          className={cn("rounded-full border border-white/10 object-cover", sizeClasses[size])}
        />
      ) : (
        <div className={cn(
          "rounded-full border border-cyan-400/30",
          "bg-gradient-to-br from-cyan-400/20 to-purple-400/20",
          "flex items-center justify-center",
          "font-mono font-bold text-cyan-300",
          sizeClasses[size]
        )}>
          {initials}
        </div>
      )}

      {showName && (
        <span className="hidden sm:block text-sm font-medium text-white truncate max-w-[120px]">
          {user.name}
        </span>
      )}

      <span className={cn(
        "absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full",
        user.streak && user.streak > 0 ? "bg-yellow-400 shadow-[0_0_8px_#e3b341]" : "bg-green-400/50"
      )} aria-hidden="true" />
    </button>
  )
}