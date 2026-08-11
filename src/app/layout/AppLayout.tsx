import { Outlet, useLocation, Link } from 'react-router'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'

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

  return (
    <div className="min-h-dvh bg-warm-50 flex flex-col">
      {/* Top navigation - minimal */}
      <header className="sticky top-0 z-40 bg-warm-50/80 backdrop-blur-lg border-b border-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="flex items-center gap-2 text-warm-900 font-semibold text-lg hover:text-accent-500 transition-colors"
            >
              <span className="text-accent-400">◆</span>
              <span className="hidden sm:inline">Tripper</span>
            </Link>

            {!isHome && !isCreateTrip && (
              <nav className="hidden md:flex items-center gap-1">
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
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile bottom navigation - only on trip pages */}
      {isTripPage && tripId && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-warm-100 pb-[env(safe-area-inset-bottom)]">
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
                    'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[64px]',
                    isActive
                      ? 'text-accent-500'
                      : 'text-warm-400 hover:text-warm-600'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.label}</span>
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
        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-accent-50 text-accent-700'
          : 'text-warm-500 hover:text-warm-800 hover:bg-warm-100'
      )}
    >
      {children}
    </Link>
  )
}
