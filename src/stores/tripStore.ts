import { create } from 'zustand';
import type { User, Trip, TripMember, Preference, TripIdea, TripReaction, Destination, Itinerary, ItineraryItem, Decision, DecisionStatus, TripPhase } from '@/types';

interface TripStoreState {
  currentUser: User;
  trips: Trip[];
  activeTrip: Trip | null;
  isGeneratingIdeas: boolean;
  isGeneratingItinerary: boolean;
  
  createTrip: (data: Partial<Trip>) => string;
  setActiveTrip: (tripId: string) => void;
  addMember: (tripId: string, member: TripMember) => void;
  submitPreferences: (tripId: string, userId: string, preferences: Preference) => void;
  setTripIdeas: (tripId: string, ideas: TripIdea[]) => void;
  addReaction: (tripId: string, reaction: TripReaction) => void;
  selectDestination: (tripId: string, destination: Destination) => void;
  setItinerary: (tripId: string, itinerary: Itinerary) => void;
  updateItineraryItem: (tripId: string, dayIndex: number, itemIndex: number, item: ItineraryItem) => void;
  addItineraryItem: (tripId: string, dayIndex: number, item: ItineraryItem) => void;
  removeItineraryItem: (tripId: string, dayIndex: number, itemIndex: number) => void;
  moveItineraryItem: (tripId: string, fromDay: number, fromIndex: number, toDay: number, toIndex: number) => void;
  addDecision: (tripId: string, decision: Decision) => void;
  updateDecisionStatus: (tripId: string, decisionId: string, status: DecisionStatus) => void;
  setPhase: (tripId: string, phase: TripPhase) => void;
  setGeneratingIdeas: (value: boolean) => void;
  setGeneratingItinerary: (value: boolean) => void;
}

const defaultUser: User = { id: 'user_1', name: 'Bhara', email: 'bhara@email.com' };

export const useTripStore = create<TripStoreState>((set, get) => ({
  currentUser: defaultUser,
  trips: [],
  activeTrip: null,
  isGeneratingIdeas: false,
  isGeneratingItinerary: false,

  createTrip: (data) => {
    const id = `trip_${Date.now()}`;
    const newTrip: Trip = {
      id,
      name: data.name || 'New Trip',
      status: 'draft',
      phase: 'discover',
      createdAt: new Date(),
      updatedAt: new Date(),
      origin: data.origin || '',
      flexibleDates: data.flexibleDates ?? true,
      currency: 'IDR',
      budgetFlexibility: 50,
      travelers: data.travelers || 1,
      members: [{
        userId: defaultUser.id,
        name: defaultUser.name,
        role: 'admin',
        joinedAt: new Date(),
        preferencesSubmitted: false
      }],
      preferences: [],
      tripIdeas: [],
      reactions: [],
      decisions: [],
      tasks: [],
      expenses: [],
      ...data,
    } as Trip;

    set((state) => ({ trips: [...state.trips, newTrip] }));
    return id;
  },

  setActiveTrip: (tripId) => set((state) => ({
    activeTrip: state.trips.find(t => t.id === tripId) || null
  })),

  addMember: (tripId, member) => set((state) => {
    const trips = state.trips.map(trip => 
      trip.id === tripId ? { ...trip, members: [...trip.members, member], updatedAt: new Date() } : trip
    );
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  submitPreferences: (tripId, userId, preferences) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId) {
        const existingPrefIndex = trip.preferences.findIndex(p => p.userId === userId);
        const newPreferences = [...trip.preferences];
        if (existingPrefIndex >= 0) {
          newPreferences[existingPrefIndex] = preferences;
        } else {
          newPreferences.push(preferences);
        }
        
        const members = trip.members.map(m => 
          m.userId === userId ? { ...m, preferencesSubmitted: true } : m
        );
        
        return { ...trip, preferences: newPreferences, members, updatedAt: new Date() };
      }
      return trip;
    });
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  setTripIdeas: (tripId, ideas) => set((state) => {
    const trips = state.trips.map(trip => 
      trip.id === tripId ? { ...trip, tripIdeas: ideas, updatedAt: new Date() } : trip
    );
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  addReaction: (tripId, reaction) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId) {
        const existingIndex = trip.reactions.findIndex(r => r.userId === reaction.userId && r.tripIdeaId === reaction.tripIdeaId);
        const newReactions = [...trip.reactions];
        if (existingIndex >= 0) {
          newReactions[existingIndex] = reaction;
        } else {
          newReactions.push(reaction);
        }
        return { ...trip, reactions: newReactions, updatedAt: new Date() };
      }
      return trip;
    });
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  selectDestination: (tripId, destination) => set((state) => {
    const trips = state.trips.map(trip => 
      trip.id === tripId ? { ...trip, selectedDestination: destination, status: 'planning' as const, phase: 'plan' as const, updatedAt: new Date() } : trip
    );
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  setItinerary: (tripId, itinerary) => set((state) => {
    const trips = state.trips.map(trip => 
      trip.id === tripId ? { ...trip, itinerary, updatedAt: new Date() } : trip
    );
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  updateItineraryItem: (tripId, dayIndex, itemIndex, item) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId && trip.itinerary) {
        const newDays = [...trip.itinerary.days];
        const newItems = [...newDays[dayIndex].items];
        newItems[itemIndex] = item;
        newDays[dayIndex] = { ...newDays[dayIndex], items: newItems };
        return { ...trip, itinerary: { ...trip.itinerary, days: newDays }, updatedAt: new Date() };
      }
      return trip;
    });
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  addItineraryItem: (tripId, dayIndex, item) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId && trip.itinerary) {
        const newDays = [...trip.itinerary.days];
        newDays[dayIndex] = { ...newDays[dayIndex], items: [...newDays[dayIndex].items, item] };
        return { ...trip, itinerary: { ...trip.itinerary, days: newDays }, updatedAt: new Date() };
      }
      return trip;
    });
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  removeItineraryItem: (tripId, dayIndex, itemIndex) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId && trip.itinerary) {
        const newDays = [...trip.itinerary.days];
        const newItems = [...newDays[dayIndex].items];
        newItems.splice(itemIndex, 1);
        newDays[dayIndex] = { ...newDays[dayIndex], items: newItems };
        return { ...trip, itinerary: { ...trip.itinerary, days: newDays }, updatedAt: new Date() };
      }
      return trip;
    });
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  moveItineraryItem: (tripId, fromDay, fromIndex, toDay, toIndex) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId && trip.itinerary) {
        const newDays = [...trip.itinerary.days];
        const itemToMove = newDays[fromDay].items[fromIndex];
        
        // Remove from original position
        const fromItems = [...newDays[fromDay].items];
        fromItems.splice(fromIndex, 1);
        newDays[fromDay] = { ...newDays[fromDay], items: fromItems };
        
        // Add to new position
        const toItems = fromDay === toDay ? [...newDays[fromDay].items] : [...newDays[toDay].items];
        toItems.splice(toIndex, 0, itemToMove);
        newDays[toDay] = { ...newDays[toDay], items: toItems };
        
        return { ...trip, itinerary: { ...trip.itinerary, days: newDays }, updatedAt: new Date() };
      }
      return trip;
    });
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  addDecision: (tripId, decision) => set((state) => {
    const trips = state.trips.map(trip => 
      trip.id === tripId ? { ...trip, decisions: [...trip.decisions, decision], updatedAt: new Date() } : trip
    );
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  updateDecisionStatus: (tripId, decisionId, status) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId) {
        const decisions = trip.decisions.map(d => 
          d.id === decisionId ? { ...d, status } : d
        );
        return { ...trip, decisions, updatedAt: new Date() };
      }
      return trip;
    });
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  setPhase: (tripId, phase) => set((state) => {
    const trips = state.trips.map(trip => 
      trip.id === tripId ? { ...trip, phase, updatedAt: new Date() } : trip
    );
    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  setGeneratingIdeas: (value) => set({ isGeneratingIdeas: value }),
  setGeneratingItinerary: (value) => set({ isGeneratingItinerary: value }),
}));
