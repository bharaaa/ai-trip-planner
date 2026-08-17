import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { AppLayout } from './app/layout/AppLayout'
import { HomePage } from './features/home/HomePage'
import { CreateTripPage } from './features/trips/CreateTripPage'
import { PreferencesPage } from './features/preferences/PreferencesPage'
import { DiscoveryPage } from './features/discovery/DiscoveryPage'
import { PlannerPage } from './features/itinerary/PlannerPage'
import { DecisionsPage } from './features/decisions/DecisionsPage'
import { TripDashboardPage } from './features/trips/TripDashboardPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { useAuthStore } from './stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <div className="min-h-screen bg-warm-50 flex items-center justify-center">Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

import { Toaster } from 'react-hot-toast'

export function App() {
  const initializeAuth = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
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
