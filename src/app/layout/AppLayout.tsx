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
  { id: 'itinerary' as const, label: 'Itinerary', icon: '📋', path: 'itinerary' },
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
    <div className="min-h-dvh w-full bg-warm-950 flex flex-col font-sans">
      {/* Floating Pill Navigation */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto bg-warm-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full flex items-center h-14 px-4 sm:px-6 w-full max-w-5xl justify-between text-white transition-all duration-300"
        >
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
                <NavLink to={`/trips/${tripId}/itinerary`} active={location.pathname.includes('/itinerary')}>
                  Itinerary
                </NavLink>
              </nav>
            )}

            {/* Right: User / Profile */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />
                  <div className="relative" ref={profileRef}>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                    >
                      <span className="text-sm font-semibold hidden sm:block max-w-[100px] truncate">{user.name || 'User'}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-500 to-accent-300 flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden border border-white/20">
                        {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </div>
                    </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 rounded-2xl bg-warm-950 shadow-2xl border border-white/10 overflow-hidden z-[100]"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-white/50 truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <button 
                            onClick={() => {
                              setIsProfileOpen(false);
                              signOut();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-error-400 hover:bg-error-500/10 rounded-xl transition-colors font-medium flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="px-4 py-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link to="/register" className="px-4 py-1.5 text-sm font-bold bg-white text-black rounded-full hover:bg-warm-100 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <motion.main 
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 relative flex flex-col"
      >
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </motion.main>

      {/* Mobile bottom navigation - only on trip pages */}
      {isTripPage && tripId && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-warm-950/90 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
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
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <span className={cn("text-xl relative z-10 transition-transform", isActive && "scale-110")}>{item.icon}</span>
                  <span className="text-[10px] font-semibold tracking-wide relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 bg-white/10 rounded-xl -z-0"
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
