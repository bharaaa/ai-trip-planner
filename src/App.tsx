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
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="trips/new" element={<CreateTripPage />} />
            <Route path="trips/:tripId" element={<TripDashboardPage />} />
            <Route path="trips/:tripId/preferences" element={<PreferencesPage />} />
            <Route path="trips/:tripId/discover" element={<DiscoveryPage />} />
            <Route path="trips/:tripId/plan" element={<PlannerPage />} />
            <Route path="trips/:tripId/decisions" element={<DecisionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
