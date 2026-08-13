import React, { useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { AnimatePresence, motion } from 'motion/react'
import { useTripStore } from '@/stores/tripStore'

const mobileNavItems = [
  { id: 'discover' as const, label: 'Discover', icon: '✨', path: 'discover' },
  { id: 'plan' as const, label: 'Plan', icon: '📋', path: 'plan' },
  { id: 'decide' as const, label: 'Decide', icon: '🤝', path: 'decisions' },
  { id: 'more' as const, label: 'More', icon: '⋯', path: '' },
]

export function AppLayout() {
  const location = useLocation()
  const { mobileNavTab, setMobileNavTab } = useUIStore()

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

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-medium">
                B
              </div>
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
