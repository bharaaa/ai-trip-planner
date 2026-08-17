import { useMemo } from 'react';
import { useTripStore } from '@/stores/tripStore';

export const useTrip = (tripId?: string) => {
  const activeTrip = useTripStore((state) => state.activeTrip);
  const trips = useTripStore((state) => state.trips);
  
  // If a specific ID is provided, use that trip. Otherwise default to activeTrip.
  const trip = useMemo(() => {
    if (tripId) {
      return trips.find(t => t.id === tripId) || null;
    }
    return activeTrip;
  }, [tripId, activeTrip, trips]);

  const updateDetails = useTripStore((state) => state.updateTripDetails);
  const updateDates = useTripStore((state) => state.updateTripDates);
  const setPhase = useTripStore((state) => state.setPhase);

  return {
    trip,
    updateDetails,
    updateDates,
    setPhase,
    isGeneratingIdeas: useTripStore((state) => state.isGeneratingIdeas),
    isGeneratingItinerary: useTripStore((state) => state.isGeneratingItinerary),
  };
};
