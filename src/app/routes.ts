export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TRIP_CREATE: '/trips/new',
  TRIP_DASHBOARD: (id: string) => `/trips/${id}`,
  TRIP_DISCOVERY: (id: string) => `/trips/${id}/discover`,
  TRIP_PLANNER: (id: string) => `/trips/${id}/plan`,
  TRIP_DECISIONS: (id: string) => `/trips/${id}/decisions`,
  TRIP_PREFERENCES: (id: string) => `/trips/${id}/preferences`,
};
