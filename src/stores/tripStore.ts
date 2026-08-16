import { create } from 'zustand';
import type { User, Trip, TripMember, Preference, TripIdea, TripReaction, Destination, Itinerary, ItineraryItem, Decision, DecisionStatus, TripPhase } from '@/types';
import { tripService } from '@/services/trip/tripService';
import { activityService } from '@/services/trip/activityService';
import { notificationService } from '@/services/notification/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from './authStore';

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
  inviteMember: (tripId: string, member: TripMember) => void;
  joinTrip: (tripId: string) => Promise<void>;
  rejectInvitation: (tripId: string) => Promise<void>;
  removeMember: (tripId: string, memberId: string, memberName: string) => void;
  cancelInvitation: (tripId: string, memberId: string, memberName: string) => void;
  leaveTrip: (tripId: string) => Promise<void>;
  submitPreferences: (tripId: string, userId: string, preferences: Preference) => void;
  setTripIdeas: (tripId: string, ideas: TripIdea[]) => void;
  toggleIdeaSaved: (tripId: string, ideaId: string, isSaved: boolean) => void;
  addReaction: (tripId: string, reaction: TripReaction) => void;
  selectDestination: (tripId: string, destination: Destination) => void;
  setItinerary: (tripId: string, itinerary: Itinerary) => void;
  updateItineraryItem: (tripId: string, dayIndex: number, itemIndex: number, item: ItineraryItem) => void;
  addItineraryItem: (tripId: string, dayIndex: number, item: ItineraryItem) => void;
  removeItineraryItem: (tripId: string, dayIndex: number, itemIndex: number) => void;
  moveItineraryItem: (tripId: string, fromDay: number, fromIndex: number, toDay: number, toIndex: number) => void;
  addDecision: (tripId: string, decision: Decision) => void;
  updateDecisionStatus: (tripId: string, decisionId: string, status: DecisionStatus, decidedOptionId?: string) => void;
  addDecisionVote: (tripId: string, decisionId: string, optionId: string, userId: string, vote: 'for' | 'against' | 'neutral') => void;
  removeDecisionVote: (tripId: string, decisionId: string, optionId: string, userId: string) => void;
  setPhase: (tripId: string, phase: TripPhase) => void;
  updateTripDates: (tripId: string, data: { flexibleDates: boolean, startDate?: Date, endDate?: Date, dateMonth?: string, duration?: number }) => Promise<void>;
  updateTripDetails: (tripId: string, data: { origin: string, travelers: number, duration: number, budgetPerPerson: number }) => Promise<void>;
  fetchTripActivities: (tripId: string) => Promise<void>;
  setGeneratingIdeas: (value: boolean) => void;
  setGeneratingItinerary: (value: boolean) => void;
}

// Helper to update a specific trip
const updateTrip = (trips: Trip[], tripId: string, updater: (trip: Trip) => Trip): Trip[] => {
  return trips.map(trip => trip.id === tripId ? updater({ ...trip, updatedAt: new Date() }) : trip);
};

// Helper to keep activeTrip in sync
const syncActiveTrip = (trips: Trip[], activeTripId?: string): Trip | null => {
  if (!activeTripId) return null;
  return trips.find(t => t.id === activeTripId) || null;
};

// Helper to log and sync activity to the local state
const logAndSyncActivity = (tripId: string, actionType: any, details: any = {}) => {
  const user = useAuthStore.getState().user;
  activityService.logActivity(tripId, user?.id, actionType, details).then(activity => {
    if (activity) {
      useTripStore.setState(state => {
        const trips = updateTrip(state.trips, tripId, trip => ({
          ...trip,
          activities: [activity, ...(trip.activities || [])]
        }));
        return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
      });
    }
  }).catch(console.error);
};

export const useTripStore = create<TripStoreState>((set, get) => ({
  trips: [],
  activeTrip: null,
  isGeneratingIdeas: false,
  isGeneratingItinerary: false,

  fetchTrips: async () => {
    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        set({ trips: [] });
        return;
      }
      
      const trips = await tripService.fetchUserTrips(currentUser.id);
      set({ trips });
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  },

  clearTrips: () => {
    set({ trips: [], activeTrip: null });
  },

  searchUsers: async (query: string) => {
    try {
      return await tripService.searchUsers(query);
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  },

  createTrip: async (data) => {
    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) throw new Error('Not authenticated');

      const tripId = await tripService.createTrip(data, currentUser.id);
      
      // Fetch trips immediately so the newly created trip is in state
      await get().fetchTrips();
      
      return tripId;
    } catch (err) {
      console.error('Error creating trip:', err);
      throw err;
    }
  },

  setActiveTrip: async (tripId) => {
    set(state => ({ activeTrip: state.trips.find(t => t.id === tripId) || null }));
    if (tripId) {
      await get().fetchTripActivities(tripId);
    }
  },

  fetchTripActivities: async (tripId) => {
    try {
      const activities = await activityService.getActivities(tripId);
      set(state => {
        const trips = updateTrip(state.trips, tripId, trip => ({ ...trip, activities }));
        return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
      });
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  },

  inviteMember: (tripId, member) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => ({
      ...trip,
      members: [...trip.members, { ...member, status: 'invited' }]
    }));

    tripService.inviteMember(tripId, member.userId).catch(err => {
      console.error('Failed to sync member invitation:', err);
    });

    const activeTripData = state.trips.find(t => t.id === tripId);
    if (activeTripData) {
      notificationService.createNotification({
        userId: member.userId,
        actorId: useAuthStore.getState().user?.id,
        type: 'trip_invite',
        title: 'Trip Invitation',
        message: `You have been invited to join ${activeTripData.name}`,
        metadata: { tripId: activeTripData.id, tripName: activeTripData.name }
      }).catch(err => console.error('Failed to create notification:', err));
    }

    logAndSyncActivity(tripId, 'MEMBER_INVITED', { name: member.name });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  removeMember: (tripId, memberId, memberName) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => ({
      ...trip,
      members: trip.members.filter(m => m.userId !== memberId)
    }));

    tripService.removeMember(tripId, memberId).catch(err => {
      console.error('Failed to sync member removal:', err);
    });

    const activeTripData = state.trips.find(t => t.id === tripId);
    if (activeTripData) {
      notificationService.createNotification({
        userId: memberId,
        actorId: useAuthStore.getState().user?.id,
        type: 'trip_removed',
        title: 'Removed from Trip',
        message: `You have been removed from ${activeTripData.name}`,
        metadata: { tripId: activeTripData.id, tripName: activeTripData.name }
      }).catch(err => console.error('Failed to create notification:', err));
    }

    logAndSyncActivity(tripId, 'MEMBER_REMOVED', { name: memberName });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  cancelInvitation: (tripId, memberId, memberName) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => ({
      ...trip,
      members: trip.members.filter(m => m.userId !== memberId)
    }));

    tripService.removeMember(tripId, memberId).catch(err => {
      console.error('Failed to sync invitation cancellation:', err);
    });

    logAndSyncActivity(tripId, 'INVITATION_CANCELLED', { name: memberName });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  leaveTrip: async (tripId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    await activityService.logActivity(tripId, user.id, 'MEMBER_LEFT', { name: user.name || 'Someone' });
    await tripService.removeMember(tripId, user.id);
    
    useTripStore.setState(state => {
      const trips = state.trips.filter(t => t.id !== tripId);
      return { trips, activeTrip: state.activeTrip?.id === tripId ? null : state.activeTrip };
    });
  },

  joinTrip: async (tripId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await tripService.updateMemberStatus(tripId, user.id, 'joined');
    await activityService.logActivity(tripId, user.id, 'MEMBER_JOINED', { name: user.name || 'Someone' });
    useNotificationStore.getState().fetchNotifications();

    useTripStore.setState(state => {
      const trips = updateTrip(state.trips, tripId, trip => ({
        ...trip,
        members: trip.members.map(m => m.userId === user.id ? { ...m, status: 'joined' } : m)
      }));
      return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
    });
  },

  rejectInvitation: async (tripId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await tripService.removeMember(tripId, user.id);
    await activityService.logActivity(tripId, user.id, 'MEMBER_REJECTED', { name: user.name || 'Someone' });
    useNotificationStore.getState().fetchNotifications();

    useTripStore.setState(state => {
      const trips = state.trips.filter(t => t.id !== tripId);
      return { trips, activeTrip: state.activeTrip?.id === tripId ? null : state.activeTrip };
    });
  },

  submitPreferences: (tripId, userId, preferences) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
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
      
      return { ...trip, preferences: newPreferences, members };
    });

    tripService.submitPreferences(tripId, userId, preferences).catch(err => {
      console.error('Failed to sync preferences:', err);
    });

    logAndSyncActivity(tripId, 'PREFERENCES_SUBMITTED');

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  setTripIdeas: (tripId, ideas) => set((state) => {
    let mergedIdeas = ideas;
    
    const trips = updateTrip(state.trips, tripId, trip => {
      // Preserve saved ideas
      const currentSaved = trip.tripIdeas.filter(i => i.isSaved);
      // Filter out new ideas that have the same destination as a saved idea
      const newIdeasFiltered = ideas.filter(newIdea => 
        !currentSaved.some(saved => saved.destination === newIdea.destination)
      );
      mergedIdeas = [...currentSaved, ...newIdeasFiltered];
      
      return {
        ...trip,
        tripIdeas: mergedIdeas
      };
    });
    
    tripService.setTripIdeas(tripId, mergedIdeas).catch(err => {
      console.error('Failed to sync ideas:', err);
    });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  toggleIdeaSaved: (tripId, ideaId, isSaved) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      const newIdeas = trip.tripIdeas.map(idea => 
        idea.id === ideaId ? { ...idea, isSaved } : idea
      );
      
      // Move saved ideas to the top
      const savedIdeas = newIdeas.filter(i => i.isSaved);
      const unsavedIdeas = newIdeas.filter(i => !i.isSaved);
      
      return { ...trip, tripIdeas: [...savedIdeas, ...unsavedIdeas] };
    });

    tripService.toggleIdeaSaved(ideaId, isSaved).catch(err => {
      console.error('Failed to sync idea save state:', err);
    });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  addReaction: (tripId, reaction) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      const existingIndex = trip.reactions.findIndex(r => r.userId === reaction.userId && r.tripIdeaId === reaction.tripIdeaId);
      const newReactions = [...trip.reactions];
      if (existingIndex >= 0) {
        newReactions[existingIndex] = reaction;
      } else {
        newReactions.push(reaction);
      }
      return { ...trip, reactions: newReactions };
    });

    tripService.addReaction(reaction).catch(err => {
      console.error('Failed to sync reaction:', err);
    });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  selectDestination: (tripId, destination) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => ({
      ...trip,
      selectedDestination: destination,
      status: 'planning',
      phase: 'plan'
    }));

    tripService.selectDestination(tripId, destination).catch(err => {
      console.error('Failed to update destination:', err);
    });

    logAndSyncActivity(tripId, 'DESTINATION_SELECTED', { destination: destination.name });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  setItinerary: (tripId, itinerary) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => ({
      ...trip,
      itinerary
    }));

    tripService.setItinerary(tripId, itinerary).catch(err => {
      console.error('Failed to sync itinerary:', err);
    });

    logAndSyncActivity(tripId, 'ITINERARY_UPDATED', { type: 'generated' });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  updateItineraryItem: (tripId, dayIndex, itemIndex, item) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      if (!trip.itinerary) return trip;
      const newDays = [...trip.itinerary.days];
      const newItems = [...newDays[dayIndex].items];
      newItems[itemIndex] = item;
      newDays[dayIndex] = { ...newDays[dayIndex], items: newItems };
      return { ...trip, itinerary: { ...trip.itinerary, days: newDays } };
    });
    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  addItineraryItem: (tripId, dayIndex, item) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      if (!trip.itinerary) return trip;
      const newDays = [...trip.itinerary.days];
      newDays[dayIndex] = { ...newDays[dayIndex], items: [...newDays[dayIndex].items, item] };
      return { ...trip, itinerary: { ...trip.itinerary, days: newDays } };
    });
    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  removeItineraryItem: (tripId, dayIndex, itemIndex) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      if (!trip.itinerary) return trip;
      const newDays = [...trip.itinerary.days];
      const newItems = [...newDays[dayIndex].items];
      newItems.splice(itemIndex, 1);
      newDays[dayIndex] = { ...newDays[dayIndex], items: newItems };
      return { ...trip, itinerary: { ...trip.itinerary, days: newDays } };
    });
    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  moveItineraryItem: (tripId, fromDay, fromIndex, toDay, toIndex) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      if (!trip.itinerary) return trip;
      const newDays = [...trip.itinerary.days];
      const itemToMove = newDays[fromDay].items[fromIndex];
      
      const fromItems = [...newDays[fromDay].items];
      fromItems.splice(fromIndex, 1);
      newDays[fromDay] = { ...newDays[fromDay], items: fromItems };
      
      const toItems = fromDay === toDay ? [...newDays[fromDay].items] : [...newDays[toDay].items];
      toItems.splice(toIndex, 0, itemToMove);
      newDays[toDay] = { ...newDays[toDay], items: toItems };
      
      return { ...trip, itinerary: { ...trip.itinerary, days: newDays } };
    });
    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  addDecision: (tripId, decision) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => ({
      ...trip,
      decisions: [...trip.decisions, decision]
    }));
    
    tripService.addDecision(tripId, decision).catch(err => {
      console.error('Failed to sync decision:', err);
    });

    logAndSyncActivity(tripId, 'POLL_CREATED', { title: decision.title });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  updateDecisionStatus: (tripId, decisionId, status, decidedOptionId) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      const decisions = trip.decisions.map(d => 
        d.id === decisionId ? { ...d, status, decidedOption: decidedOptionId } : d
      );
      return { ...trip, decisions };
    });

    tripService.updateDecisionStatus(decisionId, status, decidedOptionId).catch(err => {
      console.error('Failed to sync decision status:', err);
    });

    const trip = state.trips.find(t => t.id === tripId);
    const decision = trip?.decisions.find(d => d.id === decisionId);
    if (decision) {
      if (status === 'decided') {
        const option = decision.options.find(o => o.id === decidedOptionId);
        logAndSyncActivity(tripId, 'POLL_DECIDED', { title: decision.title, winner: option?.title });
      } else if (status === 'deferred') {
        logAndSyncActivity(tripId, 'POLL_CLOSED', { title: decision.title });
      }
    }

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  addDecisionVote: (tripId, decisionId, optionId, userId, vote) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      const decisions = trip.decisions.map(d => {
        if (d.id === decisionId) {
          const options = d.options.map(o => {
            if (o.id === optionId) {
              const filteredVotes = o.votes.filter(v => v.userId !== userId);
              return { ...o, votes: [...filteredVotes, { userId, vote }] };
            }
            return o;
          });
          return { ...d, options };
        }
        return d;
      });
      return { ...trip, decisions };
    });

    tripService.addDecisionVote(optionId, userId, vote).catch(err => {
      console.error('Failed to sync vote:', err);
    });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  removeDecisionVote: (tripId, decisionId, optionId, userId) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => {
      const decisions = trip.decisions.map(d => {
        if (d.id === decisionId) {
          const options = d.options.map(o => {
            if (o.id === optionId) {
              const filteredVotes = o.votes.filter(v => v.userId !== userId);
              return { ...o, votes: filteredVotes };
            }
            return o;
          });
          return { ...d, options };
        }
        return d;
      });
      return { ...trip, decisions };
    });

    tripService.removeDecisionVote(optionId, userId).catch(err => {
      console.error('Failed to sync remove vote:', err);
    });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  setPhase: (tripId, phase) => set((state) => {
    const trips = updateTrip(state.trips, tripId, trip => ({
      ...trip,
      phase
    }));

    tripService.setPhase(tripId, phase).catch(err => {
      console.error('Failed to update phase:', err);
    });

    return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
  }),

  updateTripDates: async (tripId, data) => {
    await tripService.updateTripDates(tripId, data);
    
    const trip = get().trips.find(t => t.id === tripId);
    if (trip) {
      logAndSyncActivity(tripId, 'DATES_CHANGED', {
        oldDates: {
          flexibleDates: trip.flexibleDates,
          startDate: trip.startDate,
          endDate: trip.endDate,
          dateMonth: trip.dateMonth,
          duration: trip.duration
        },
        newDates: data
      });
    } else {
      logAndSyncActivity(tripId, 'DATES_CHANGED', { newDates: data });
    }

    set(state => {
      const trips = updateTrip(state.trips, tripId, trip => ({
        ...trip,
        flexibleDates: data.flexibleDates,
        startDate: data.startDate,
        endDate: data.endDate,
        dateMonth: data.dateMonth,
        duration: data.duration !== undefined ? data.duration : trip.duration
      }));
      return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
    });
  },

  updateTripDetails: async (tripId, data) => {
    await tripService.updateTripDetails(tripId, data);
    set(state => {
      const trips = updateTrip(state.trips, tripId, trip => ({
        ...trip,
        origin: data.origin,
        travelers: data.travelers,
        duration: data.duration,
        budgetPerPerson: data.budgetPerPerson
      }));
      return { trips, activeTrip: syncActiveTrip(trips, state.activeTrip?.id) };
    });
  },

  setGeneratingIdeas: (value) => set({ isGeneratingIdeas: value }),
  setGeneratingItinerary: (value) => set({ isGeneratingItinerary: value }),
}));
