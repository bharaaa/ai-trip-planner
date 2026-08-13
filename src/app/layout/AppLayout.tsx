import React, { useEffect, useState, useRef } from 'react'
import { Outlet, useLocation, Link } from 'react-router'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { AnimatePresence, motion } from 'motion/react'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/authStore'

const mobileNavItems = [
  { id: 'discover' as const, label: 'Discover', icon: '✨', path: 'discover' },
  { id: 'plan' as const, label: 'Plan', icon: '📋', path: 'plan' },
  { id: 'decide' as const, label: 'Decide', icon: '🤝', path: 'decisions' },
  { id: 'more' as const, label: 'More', icon: '⋯', path: '' },
]

export function AppLayout() {
  const location = useLocation()
  const { mobileNavTab, setMobileNavTab } = useUIStore()
  const { user, signOut } = useAuthStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

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
  const tripId = tripIdMatch ? tripIdMatch[1] : null

  const setActiveTrip = useTripStore((state) => state.setActiveTrip)
  const fetchTrips = useTripStore((state) => state.fetchTrips)

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    if (tripId) {
      setActiveTrip(tripId)
    }
  }, [tripId, setActiveTrip])

  return (
    <div className="min-h-dvh bg-warm-50 flex flex-col">
      {/* Top navigation - minimal */}
      <header className="sticky top-0 z-40 glass-heavy h-14 border-b border-warm-200/30 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-warm-900 font-semibold text-lg hover:opacity-80 transition-opacity"
            >
              <span className="text-accent-500">◆</span>
              <span className="hidden sm:inline">Tripper</span>
            </Link>

            {!isHome && !isCreateTrip && (
              <nav className="hidden md:flex items-center gap-2">
                {tripId && (
                  <>
                    <NavLink to={`/trips/${tripId}`} active={location.pathname === `/trips/${tripId}`}>
                      Overview
                    </NavLink>
                    <NavLink to={`/trips/${tripId}/discover`} active={location.pathname.includes('/discover')}>
                      Discover
                    </NavLink>
                    <NavLink to={`/trips/${tripId}/plan`} active={location.pathname.includes('/plan')}>
                      Plan
                    </NavLink>
                    <NavLink to={`/trips/${tripId}/decisions`} active={location.pathname.includes('/decisions')}>
                      Decisions
                    </NavLink>
                  </>
                )}
              </nav>
            )}

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-medium uppercase">
                  {user?.name?.[0] || user?.email?.[0] || 'U'}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-warm-200/50 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-warm-100 bg-warm-50/50">
                      <p className="text-sm font-semibold text-warm-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-warm-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false)
                          signOut()
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} className="h-full">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation - only on trip pages */}
      {isTripPage && tripId && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-warm-200/30 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-14">
            {mobileNavItems.map((item) => {
              const isActive = item.path
                ? location.pathname.includes(`/${item.path}`)
                : mobileNavTab === item.id

              return (
                <Link
                  key={item.id}
                  to={item.path ? `/trips/${tripId}/${item.path}` : `/trips/${tripId}`}
                  onClick={() => setMobileNavTab(item.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[64px] relative',
                    isActive
                      ? 'text-accent-600'
                      : 'text-warm-500 hover:text-warm-700'
                  )}
                >
                  <span className="text-lg relative z-10">{item.icon}</span>
                  <span className="text-[10px] font-medium relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 bg-accent-50 rounded-lg -z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
        'relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
        active ? 'text-accent-700' : 'text-warm-600 hover:text-warm-900'
      )}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <motion.div
          layoutId="desktop-nav-active"
          className="absolute inset-0 bg-accent-50 rounded-lg -z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  )
}
