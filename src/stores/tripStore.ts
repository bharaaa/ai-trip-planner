import { create } from 'zustand';
import type { User, Trip, TripMember, Preference, TripIdea, TripReaction, Destination, Itinerary, ItineraryItem, Decision, DecisionStatus, TripPhase } from '@/types';

interface TripStoreState {
  trips: Trip[];
  activeTrip: Trip | null;
  isGeneratingIdeas: boolean;
  isGeneratingItinerary: boolean;
  
  fetchTrips: () => Promise<void>;
  clearTrips: () => void;
  searchUsers: (query: string) => Promise<User[]>;
  createTrip: (data: Partial<Trip> & { invitedUserIds?: string[] }) => Promise<string>;
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
  addDecisionVote: (tripId: string, decisionId: string, optionId: string, userId: string, vote: 'for' | 'against' | 'neutral') => void;
  setPhase: (tripId: string, phase: TripPhase) => void;
  setGeneratingIdeas: (value: boolean) => void;
  setGeneratingItinerary: (value: boolean) => void;
}

import { useAuthStore } from './authStore';

export const useTripStore = create<TripStoreState>((set, get) => ({
  trips: [],
  activeTrip: null,
  isGeneratingIdeas: false,
  isGeneratingItinerary: false,

  // ADDED: Fetch trips from Supabase
  fetchTrips: async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const currentUser = useAuthStore.getState().user;
      
      if (!currentUser) {
        set({ trips: [] });
        return;
      }
      
      // Defense in depth: Find which trips this user is a member of
      // (Even if RLS is disabled, this prevents fetching all trips)
      const { data: memberships } = await supabase
        .from('trip_members')
        .select('trip_id')
        .eq('user_id', currentUser.id);
        
      if (!memberships || memberships.length === 0) {
        set({ trips: [] });
        return;
      }
      
      const tripIds = memberships.map(m => m.trip_id);

      // Checking if user has configured env keys
      if (!import.meta.env.VITE_SUPABASE_URL) return;

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          members:trip_members(*, users(*)),
          preferences:trip_preferences(*),
          tripIdeas:trip_ideas(
            *,
            reactions:trip_reactions(*)
          ),
          decisions(
            *,
            options:decision_options!decision_id(
              *,
              votes:decision_votes(*)
            )
          ),
          itineraries(
            *,
            days:itinerary_days(
              *,
              items:itinerary_items(*)
            )
          ),
          tasks(*),
          expenses(*)
        `)
        .in('id', tripIds)
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

          const mappedDecisions = (t.decisions || []).map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            type: d.type,
            status: d.status,
            createdAt: new Date(d.created_at),
            decidedOption: d.decided_option_id,
            options: (d.options || []).map((o: any) => ({
              id: o.id,
              title: o.title,
              description: o.description,
              votes: (o.votes || []).map((v: any) => ({
                userId: v.user_id,
                vote: v.vote
              }))
            }))
          }));

          let mappedItinerary = undefined;
          if (t.itineraries && t.itineraries.length > 0) {
            const rawItinerary = t.itineraries[0];
            const sortedDays = (rawItinerary.days || []).sort((a: any, b: any) => a.day_number - b.day_number);
            
            mappedItinerary = {
              days: sortedDays.map((day: any) => {
                const sortedItems = (day.items || []).sort((a: any, b: any) => a.order_index - b.order_index);
                return {
                  date: new Date(day.date),
                  title: day.title,
                  items: sortedItems.map((item: any) => ({
                    id: item.id,
                    time: item.time,
                    title: item.title,
                    description: item.description,
                    type: item.type,
                    location: item.location,
                    duration: item.duration,
                    isAiGenerated: item.is_ai_generated,
                    isMustDo: item.is_must_do,
                    notes: item.notes
                  }))
                };
              })
            };
          }

          const mappedPreferences = (t.preferences || []).map((p: any) => ({
            userId: p.user_id,
            categories: p.categories || {},
            pace: p.pace,
            budgetPreference: p.budget_preference,
            travelTolerance: p.travel_tolerance,
            morningPreference: p.morning_preference
          }));

          const mappedMembers = (t.members || []).map((m: any) => ({
            userId: m.user_id,
            name: m.users?.name || 'Unknown',
            avatarUrl: m.users?.avatar_url,
            role: m.role,
            joinedAt: new Date(m.joined_at),
            preferencesSubmitted: m.preferences_submitted
          }));

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
            members: mappedMembers,
            preferences: mappedPreferences,
            decisions: mappedDecisions,
            itinerary: mappedItinerary,
          };
        }) as unknown as Trip[];
        
        set({ trips: mappedTrips });
      }
    } catch (err) {
      console.error('Error fetching trips from Supabase:', err);
    }
  },

  clearTrips: () => {
    set({ trips: [], activeTrip: null });
  },

  searchUsers: async (query: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || !query.trim()) return [];
    try {
      const { supabase } = await import('@/lib/supabase');
      // Search by email or name using ilike
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(10);
        
      if (error) throw error;
      return (data || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatar_url
      })) as User[];
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
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
      startDate: data.startDate,
      endDate: data.endDate,
      currency: 'IDR',
      budgetFlexibility: 50,
      travelers: (data.invitedUserIds?.length || 0) + 1, // Admin + invited
      preferences: [],
      tripIdeas: [],
      reactions: [],
      decisions: [],
      tasks: [],
      expenses: [],
      ...data,
    } as Trip;

    let adminId = '00000000-0000-0000-0000-000000000001';

    if (import.meta.env.VITE_SUPABASE_URL) {
      const { supabase } = await import('@/lib/supabase');
      
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        adminId = userData.user.id;
      }

      const { data: insertedTrip, error } = await supabase.from('trips').insert({
        name: newTrip.name,
        origin: newTrip.origin,
        travelers: newTrip.travelers,
        status: newTrip.status,
        phase: newTrip.phase,
        flexible_dates: newTrip.flexibleDates,
        start_date: newTrip.startDate?.toISOString().split('T')[0],
        end_date: newTrip.endDate?.toISOString().split('T')[0],
        duration: newTrip.duration
      }).select().single();

      if (!error && insertedTrip) {
        finalId = insertedTrip.id;
        newTrip.id = finalId;
        
        // Prepare members to insert
        const membersToInsert = [
          {
            trip_id: finalId,
            user_id: adminId,
            role: 'admin',
            preferences_submitted: false
          }
        ];

        if (data.invitedUserIds && data.invitedUserIds.length > 0) {
          data.invitedUserIds.forEach(id => {
            if (id !== adminId) {
              membersToInsert.push({
                trip_id: finalId,
                user_id: id,
                role: 'member',
                preferences_submitted: false
              });
            }
          });
        }

        await supabase.from('trip_members').insert(membersToInsert);
      }
    } else {
      newTrip.id = finalId;
    }

    const currentUser = useAuthStore.getState().user;
    newTrip.members = [
      {
        userId: adminId,
        name: currentUser?.name || 'Admin',
        role: 'admin',
        joinedAt: new Date(),
        preferencesSubmitted: false
      }
      // Note: we don't fetch the full user profiles of the invited members immediately here.
      // They will be populated on the next fetchTrips.
    ];

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

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.from('trip_preferences').upsert({
          trip_id: tripId,
          user_id: userId,
          categories: preferences.categories,
          pace: preferences.pace,
          budget_preference: preferences.budgetPreference,
          travel_tolerance: preferences.travelTolerance,
          morning_preference: preferences.morningPreference
        }).then(({ error }) => {
          if (error) console.error('Failed to sync preferences:', error);
        });
        supabase.from('trip_members').update({ preferences_submitted: true }).eq('trip_id', tripId).eq('user_id', userId).then();
      }
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

    // Sync to Supabase
    import('@/lib/supabase').then(async ({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        try {
          // 1. Delete existing itinerary to replace (cascade deletes days/items)
          await supabase.from('itineraries').delete().eq('trip_id', tripId);
          
          // 2. Insert new itinerary
          const { data: itData, error: itError } = await supabase.from('itineraries')
            .insert({ trip_id: tripId, is_ai_draft: true }).select().single();
            
          if (itError || !itData) throw itError;

          // 3. Insert days
          const daysPayload = itinerary.days.map((d, index) => ({
            itinerary_id: itData.id,
            day_number: index + 1,
            date: d.date.toISOString(),
            title: d.title || `Day ${index + 1}`
          }));
          
          const { data: daysData, error: daysError } = await supabase.from('itinerary_days')
            .insert(daysPayload).select();
            
          if (daysError || !daysData) throw daysError;

          // 4. Insert items
          const itemsPayload: any[] = [];
          itinerary.days.forEach((day, dIndex) => {
            const dayRecord = daysData.find(d => d.day_number === dIndex + 1);
            if (dayRecord) {
              day.items.forEach((item, iIndex) => {
                itemsPayload.push({
                  day_id: dayRecord.id,
                  time: item.time,
                  title: item.title,
                  description: item.description,
                  type: item.type,
                  location: item.location,
                  duration: item.duration,
                  is_ai_generated: item.isAiGenerated,
                  is_must_do: item.isMustDo,
                  notes: item.notes,
                  order_index: iIndex
                });
              });
            }
          });
          
          if (itemsPayload.length > 0) {
            await supabase.from('itinerary_items').insert(itemsPayload);
          }
        } catch (err) {
          console.error('Failed to sync itinerary to Supabase:', err);
        }
      }
    });

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
    
    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.from('decisions').insert({
          id: decision.id,
          trip_id: tripId,
          title: decision.title,
          description: decision.description,
          type: decision.type,
          status: decision.status
        }).then(({ error }) => {
          if (error) console.error('Failed to sync decision:', error);
          else {
            // Insert options
            const options = decision.options.map(o => ({
              id: o.id,
              decision_id: decision.id,
              title: o.title,
              description: o.description
            }));
            supabase.from('decision_options').insert(options).then();
          }
        });
      }
    });

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

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.from('decisions').update({ status }).eq('id', decisionId).then(({ error }) => {
          if (error) console.error('Failed to sync decision status:', error);
        });
      }
    });

    return { trips, activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null };
  }),

  addDecisionVote: (tripId, decisionId, optionId, userId, vote) => set((state) => {
    const trips = state.trips.map(trip => {
      if (trip.id === tripId) {
        const decisions = trip.decisions.map(d => {
          if (d.id === decisionId) {
            const options = d.options.map(o => {
              if (o.id === optionId) {
                // Remove existing vote by this user if any
                const filteredVotes = o.votes.filter(v => v.userId !== userId);
                return { ...o, votes: [...filteredVotes, { userId, vote }] };
              } else {
                // If it's single vote logic, maybe remove vote from other options?
                // Assuming it's simple multi-vote for now, but usually voting 'for' removes 'for' on others.
                return o;
              }
            });
            return { ...d, options };
          }
          return d;
        });
        return { ...trip, decisions, updatedAt: new Date() };
      }
      return trip;
    });

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase }) => {
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.from('decision_votes').upsert({
          decision_option_id: optionId,
          user_id: userId,
          vote: vote
        }).then(({ error }) => {
          if (error) console.error('Failed to sync vote:', error);
        });
      }
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
