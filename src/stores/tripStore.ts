import { create } from 'zustand';
import type { User, Trip, TripMember, Preference, TripIdea, TripReaction, Destination, Itinerary, ItineraryItem, Decision, DecisionStatus, TripPhase } from '@/types';

interface TripStoreState {
  currentUser: User;
  trips: Trip[];
  activeTrip: Trip | null;
  isGeneratingIdeas: boolean;
  isGeneratingItinerary: boolean;
  
  fetchTrips: () => Promise<void>;
  createTrip: (data: Partial<Trip>) => Promise<string>;
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

const defaultUser: User = { id: '00000000-0000-0000-0000-000000000001', name: 'Bhara', email: 'bhara@email.com' };

export const useTripStore = create<TripStoreState>((set, get) => ({
  currentUser: defaultUser,
  trips: [],
  activeTrip: null,
  isGeneratingIdeas: false,
  isGeneratingItinerary: false,

  // ADDED: Fetch trips from Supabase
  fetchTrips: async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      // Checking if user has configured env keys
      if (!import.meta.env.VITE_SUPABASE_URL) return;

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          members:trip_members(*),
          preferences:trip_preferences(*),
          tripIdeas:trip_ideas(
            *,
            reactions:trip_reactions(*)
          ),
          decisions(*),
          tasks(*),
          expenses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map snake_case database rows back to camelCase frontend types
        const mappedTrips = data.map((t: any) => {
          const allReactions: any[] = [];
          
          const mappedIdeas = (t.tripIdeas || []).map((idea: any) => {
            if (idea.reactions) {
              allReactions.push(...idea.reactions.map((r: any) => ({
                ...r,
                tripIdeaId: r.trip_idea_id,
                userId: r.user_id,
              })));
            }
            
            return {
              id: idea.id,
              destination: idea.destination,
              country: idea.country,
              countryCode: idea.country_code,
              title: idea.title,
              summary: idea.summary,
              estimatedBudget: {
                min: idea.estimated_budget_min,
                max: idea.estimated_budget_max,
                currency: idea.currency || 'IDR'
              },
              fitScore: idea.fit_score,
              reasons: idea.reasons || [],
              highlights: idea.highlights || [],
              tradeoffs: idea.tradeoffs || [],
              suggestedDuration: idea.suggested_duration,
              travelStyle: idea.travel_style,
              keyActivities: idea.key_activities || [],
              confidence: idea.confidence,
              imageUrl: idea.image_url,
            };
          });

          return {
            ...t,
            flexibleDates: t.flexible_dates,
            budgetPerPerson: t.budget_per_person,
            totalBudget: t.total_budget,
            budgetFlexibility: t.budget_flexibility,
            travelConstraints: t.travel_constraints,
            selectedDestination: t.selected_destination,
            tripIdeas: mappedIdeas,
            reactions: allReactions,
            members: t.members || [],
            preferences: t.preferences || [],
            decisions: t.decisions || [],
          };
        }) as unknown as Trip[];
        
        set({ trips: mappedTrips });
      }
    } catch (err) {
      console.error('Error fetching trips from Supabase:', err);
    }
  },

  createTrip: async (data) => {
    let finalId = `trip_${Date.now()}`;
    const newTrip = {
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
      preferences: [],
      tripIdeas: [],
      reactions: [],
      decisions: [],
      tasks: [],
      expenses: [],
      ...data,
    } as Trip;

    if (import.meta.env.VITE_SUPABASE_URL) {
      const { supabase } = await import('@/lib/supabase');
      const { data: insertedTrip, error } = await supabase.from('trips').insert({
        name: newTrip.name,
        origin: newTrip.origin,
        travelers: newTrip.travelers,
        status: newTrip.status,
        phase: newTrip.phase
      }).select().single();

      if (!error && insertedTrip) {
        finalId = insertedTrip.id;
        newTrip.id = finalId;
        
        // Insert admin member
        await supabase.from('trip_members').insert({
          trip_id: finalId,
          user_id: '00000000-0000-0000-0000-000000000001',
          role: 'admin',
          preferences_submitted: false
        });
      }
    } else {
      newTrip.id = finalId;
    }

    newTrip.members = [{
      userId: '00000000-0000-0000-0000-000000000001',
      name: defaultUser.name,
      role: 'admin',
      joinedAt: new Date(),
      preferencesSubmitted: false
    }];

    set((state) => ({ trips: [newTrip, ...state.trips] }));
    return finalId;
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
    
    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        const payload = ideas.map(idea => ({
          trip_id: tripId,
          destination: idea.destination,
          country: idea.country,
          country_code: idea.countryCode,
          title: idea.title,
          summary: idea.summary,
          fit_score: idea.fitScore
        }));
        supabase.from('trip_ideas').insert(payload).then(({ error }) => {
          if (error) console.error('Failed to sync ideas to Supabase:', error);
        });
      }
    });

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

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.from('trip_reactions').upsert({
          trip_idea_id: reaction.tripIdeaId,
          user_id: reaction.userId,
          reaction: reaction.reaction,
          reason: reaction.reason
        }).then(({ error }) => {
          if (error) console.error('Failed to sync reaction:', error);
        });
      }
    });

    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  selectDestination: (tripId, destination) => set((state) => {
    const trips = state.trips.map(trip => 
      trip.id === tripId ? { ...trip, selectedDestination: destination, status: 'planning' as const, phase: 'plan' as const, updatedAt: new Date() } : trip
    );

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.from('trips').update({
          selected_destination: destination,
          status: 'planning',
          phase: 'plan'
        }).eq('id', tripId).then(({ error }) => {
          if (error) console.error('Failed to update destination:', error);
        });
      }
    });

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
        
        const fromItems = [...newDays[fromDay].items];
        fromItems.splice(fromIndex, 1);
        newDays[fromDay] = { ...newDays[fromDay], items: fromItems };
        
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
