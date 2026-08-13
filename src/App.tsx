import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from './app/layout/AppLayout'
import { HomePage } from './features/home/HomePage'
import { CreateTripPage } from './features/trips/CreateTripPage'
import { PreferencesPage } from './features/preferences/PreferencesPage'
import { DiscoveryPage } from './features/discovery/DiscoveryPage'
import { PlannerPage } from './features/itinerary/PlannerPage'
import { DecisionsPage } from './features/decisions/DecisionsPage'
import { TripDashboardPage } from './features/trips/TripDashboardPage'
import { LoginPage } from './features/auth/LoginPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="trips/new" element={<CreateTripPage />} />
            <Route path="trips/:id" element={<TripDashboardPage />} />
            <Route path="trips/:id/preferences" element={<PreferencesPage />} />
            <Route path="trips/:id/discover" element={<DiscoveryPage />} />
            <Route path="trips/:id/plan" element={<PlannerPage />} />
            <Route path="trips/:id/decisions" element={<DecisionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
