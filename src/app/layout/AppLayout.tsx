import React, { useEffect, useState, useRef } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { showNotificationToast } from '@/features/notifications/components/NotificationToast'
import { AnimatePresence, motion } from 'motion/react'

const mobileNavItems = [
  { id: 'discover' as const, label: 'Discover', icon: '✨', path: 'discover' },
  { id: 'decide' as const, label: 'Decide', icon: '🤝', path: 'decisions' },
  { id: 'plan' as const, label: 'Plan', icon: '📋', path: 'plan' },
  { id: 'more' as const, label: 'More', icon: '⋯', path: '' },
]

export function AppLayout() {
  const location = useLocation()
  const { mobileNavTab, setMobileNavTab } = useUIStore()
  const { user, signOut } = useAuthStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isHome = location.pathname === '/'
  const isCreateTrip = location.pathname === '/trips/new'
  const isTripPage = location.pathname.startsWith('/trips/') && !isCreateTrip

  // Extract tripId from path for mobile nav links
  const tripIdMatch = location.pathname.match(/\/trips\/([^/]+)/)
  const tripId = tripIdMatch && tripIdMatch[1] !== 'new' ? tripIdMatch[1] : null

  const setActiveTrip = useTripStore((state) => state.setActiveTrip)
  const activeTrip = useTripStore((state) => state.activeTrip)
  const fetchTrips = useTripStore((state) => state.fetchTrips)
  
  const { fetchNotifications, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationStore()

  useEffect(() => {
    fetchTrips()
    fetchNotifications()
    subscribeToNotifications((n) => {
      showNotificationToast(n, navigate)
    })
    return () => unsubscribeFromNotifications()
  }, [fetchTrips, fetchNotifications, subscribeToNotifications, unsubscribeFromNotifications, navigate])

  useEffect(() => {
    if (tripId) {
      setActiveTrip(tripId)
    }
  }, [tripId, setActiveTrip])

  return (
    <div className="min-h-dvh bg-warm-50 flex flex-col font-sans">
      {/* Floating Pill Navigation */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-warm-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full flex items-center h-14 px-4 sm:px-6 w-full max-w-5xl justify-between text-white transition-all duration-300">
            {/* Left: Branding or Trip Identity */}
            <div className="flex items-center gap-4">
              {(!isHome && !isCreateTrip) && (
                <Link
                  to="/"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white hover:text-white hover:bg-white/20 transition-colors shrink-0"
                  title="Back to Home"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
              )}
              
              {isTripPage && activeTrip ? (
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-warm-400">Your Trip</span>
                  <span className="text-sm font-semibold text-white leading-tight truncate max-w-[150px] sm:max-w-xs">{activeTrip.name || 'Untitled Trip'}</span>
                </div>
              ) : (
                <Link
                  to="/"
                  className="flex items-center gap-2 text-white font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
                >
                  <span className="text-accent-400 text-xl">◆</span>
                  <span className="hidden sm:inline">Tripper</span>
                </Link>
              )}
            </div>

            {/* Center: Trip Navigation (Desktop) */}
            {isTripPage && tripId && (
              <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                <NavLink to={`/trips/${tripId}`} active={location.pathname === `/trips/${tripId}` || location.pathname === `/trips/${tripId}/`}>
                  Overview
                </NavLink>
                <NavLink to={`/trips/${tripId}/discover`} active={location.pathname.includes('/discover')}>
                  Discover
                </NavLink>
                <NavLink to={`/trips/${tripId}/decisions`} active={location.pathname.includes('/decisions')}>
                  Decide
                </NavLink>
                <NavLink to={`/trips/${tripId}/plan`} active={location.pathname.includes('/plan')}>
                  Plan
                </NavLink>
              </nav>
            )}

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-3">
              <NotificationBell />

              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-semibold uppercase shadow-sm border border-accent-200">
                    {user?.name?.[0] || user?.email?.[0] || 'U'}
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl bg-white shadow-xl shadow-warm-900/5 border border-warm-200/60 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-warm-100 bg-warm-50/50">
                        <p className="text-sm font-semibold text-warm-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-warm-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false)
                            signOut()
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-xl transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname} 
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation - only on trip pages */}
      {isTripPage && tripId && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-warm-200/50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(40,35,30,0.04)]">
          <div className="flex items-center justify-around h-16 px-2">
            {mobileNavItems.map((item) => {
              const isActive = item.path
                ? location.pathname.includes(`/${item.path}`)
                : mobileNavTab === item.id || (item.id === 'more' && location.pathname === `/trips/${tripId}`)

              return (
                <Link
                  key={item.id}
                  to={item.path ? `/trips/${tripId}/${item.path}` : `/trips/${tripId}`}
                  onClick={() => setMobileNavTab(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-colors relative',
                    isActive
                      ? 'text-accent-600'
                      : 'text-warm-400 hover:text-warm-600'
                  )}
                >
                  <span className={cn("text-xl relative z-10 transition-transform", isActive && "scale-110")}>{item.icon}</span>
                  <span className="text-[10px] font-semibold tracking-wide relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 bg-accent-50 rounded-xl -z-0"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
        active ? 'text-white' : 'text-warm-300 hover:text-white'
      )}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <motion.div
          layoutId="desktop-nav-active"
          className="absolute inset-0 bg-white/20 rounded-full shadow-sm -z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
    </Link>
  )
}
