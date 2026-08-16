import { supabase } from '@/lib/supabase';
import type { Trip, TripIdea, TripReaction, Destination, Itinerary, Preference, Decision, DecisionStatus, TripPhase, User } from '@/types';
import { mapTripResponse } from './mappers';

export const tripService = {
  fetchUserTrips: async (userId: string): Promise<Trip[]> => {
    // Defense in depth: Find which trips this user is a member of
    const { data: memberships, error: membershipError } = await supabase
      .from('trip_members')
      .select('trip_id')
      .eq('user_id', userId);
      
    if (membershipError) throw membershipError;
    if (!memberships || memberships.length === 0) return [];
    
    const tripIds = memberships.map(m => m.trip_id);

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
    if (!data) return [];
    
    return mapTripResponse(data);
  },

  createTrip: async (tripData: any, creatorId: string): Promise<string> => {
    // Insert trip
    const { data: tripResult, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: tripData.name,
        origin: tripData.origin,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        date_month: tripData.dateMonth,
        flexible_dates: tripData.flexibleDates,
        duration: tripData.duration,
        budget_per_person: tripData.budgetPerPerson,
        total_budget: tripData.totalBudget,
        budget_flexibility: tripData.budgetFlexibility,
        travel_constraints: tripData.travelConstraints,
        status: 'draft',
        phase: 'discover'
      })
      .select()
      .single();

    if (tripError || !tripResult) throw tripError;

    // Insert creator as admin
    const { error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: tripResult.id,
        user_id: creatorId,
        role: 'admin'
      });
      
    if (memberError) throw memberError;

    // Insert invited users as members
    if (tripData.invitedUserIds && tripData.invitedUserIds.length > 0) {
      const invitedMembers = tripData.invitedUserIds.map((id: string) => ({
        trip_id: tripResult.id,
        user_id: id,
        role: 'member'
      }));
      
      const { error: inviteError } = await supabase
        .from('trip_members')
        .insert(invitedMembers);
        
      if (inviteError) throw inviteError;
    }

    return tripResult.id;
  },

  addMember: async (tripId: string, memberId: string): Promise<void> => {
    const { error } = await supabase
      .from('trip_members')
      .insert({
        trip_id: tripId,
        user_id: memberId,
        role: 'member'
      });
      
    if (error) throw error;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];
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
  },

  submitPreferences: async (tripId: string, userId: string, preferences: Preference): Promise<void> => {
    const { error: prefError } = await supabase.from('trip_preferences').upsert({
      trip_id: tripId,
      user_id: userId,
      categories: preferences.categories,
      pace: preferences.pace,
      budget_preference: preferences.budgetPreference,
      travel_tolerance: preferences.travelTolerance,
      morning_preference: preferences.morningPreference
    });
    if (prefError) throw prefError;

    const { error: memError } = await supabase.from('trip_members').update({ preferences_submitted: true }).eq('trip_id', tripId).eq('user_id', userId);
    if (memError) throw memError;
  },

  updateTripDates: async (tripId: string, data: { flexibleDates: boolean, startDate?: Date, endDate?: Date, dateMonth?: string, duration?: number }): Promise<void> => {
    const { error } = await supabase.from('trips').update({
      flexible_dates: data.flexibleDates,
      start_date: data.startDate?.toISOString(),
      end_date: data.endDate?.toISOString(),
      date_month: data.dateMonth,
      duration: data.duration,
      updated_at: new Date().toISOString()
    }).eq('id', tripId);
    if (error) throw error;
  },

  updateTripDetails: async (tripId: string, data: { origin: string, travelers: number, duration: number, budgetPerPerson: number }): Promise<void> => {
    const { error } = await supabase.from('trips').update({
      origin: data.origin,
      travelers: data.travelers,
      duration: data.duration,
      budget_per_person: data.budgetPerPerson,
      updated_at: new Date().toISOString()
    }).eq('id', tripId);
    if (error) throw error;
  },

  toggleIdeaSaved: async (ideaId: string, isSaved: boolean): Promise<void> => {
    const { error } = await supabase.from('trip_ideas').update({
      is_saved: isSaved,
    }).eq('id', ideaId);
    if (error) throw error;
  },

  setTripIdeas: async (tripId: string, ideas: TripIdea[]): Promise<void> => {
    // Only delete ideas that are NOT saved
    await supabase.from('trip_ideas').delete().eq('trip_id', tripId).eq('is_saved', false);
    
    const payload = ideas.map(idea => ({
      trip_id: tripId,
      destination: idea.destination,
      country: idea.country,
      country_code: idea.countryCode,
      title: idea.title,
      summary: idea.summary,
      fit_score: idea.fitScore,
      image_url: idea.imageUrl,
      estimated_budget_min: idea.estimatedBudget?.min,
      estimated_budget_max: idea.estimatedBudget?.max,
      currency: idea.estimatedBudget?.currency,
      suggested_duration: idea.suggestedDuration,
      travel_style: idea.travelStyle,
      key_activities: idea.keyActivities,
      confidence: idea.confidence,
      reasons: idea.reasons || [],
      highlights: idea.highlights || [],
      tradeoffs: idea.tradeoffs || [],
      is_saved: idea.isSaved || false
    }));
    const { error } = await supabase.from('trip_ideas').insert(payload);
    if (error) throw error;
  },

  addReaction: async (reaction: TripReaction): Promise<void> => {
    const { error } = await supabase.from('trip_reactions').upsert({
      trip_idea_id: reaction.tripIdeaId,
      user_id: reaction.userId,
      reaction: reaction.reaction,
      reason: reaction.reason
    });
    if (error) throw error;
  },

  selectDestination: async (tripId: string, destination: Destination): Promise<void> => {
    const { error } = await supabase.from('trips').update({
      selected_destination: destination,
      status: 'planning',
      phase: 'plan'
    }).eq('id', tripId);
    if (error) throw error;
  },

  setItinerary: async (tripId: string, itinerary: Itinerary): Promise<void> => {
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
      date: d.date ? d.date.toISOString() : undefined,
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
            is_ai_generated: item.isAIGenerated,
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
  },

  addDecision: async (tripId: string, decision: Decision): Promise<void> => {
    const { error } = await supabase.from('decisions').insert({
      id: decision.id,
      trip_id: tripId,
      title: decision.title,
      description: decision.description,
      type: decision.type,
      status: decision.status
    });
    if (error) throw error;

    const options = decision.options.map(o => ({
      id: o.id,
      decision_id: decision.id,
      title: o.title,
      description: o.description
    }));
    const { error: optError } = await supabase.from('decision_options').insert(options);
    if (optError) throw optError;
  },

  updateDecisionStatus: async (decisionId: string, status: DecisionStatus): Promise<void> => {
    const { error } = await supabase.from('decisions').update({ status }).eq('id', decisionId);
    if (error) throw error;
  },

  addDecisionVote: async (optionId: string, userId: string, vote: 'for' | 'against' | 'neutral'): Promise<void> => {
    const { error } = await supabase.from('decision_votes').upsert({
      decision_option_id: optionId,
      user_id: userId,
      vote: vote
    });
    if (error) throw error;
  },

  setPhase: async (tripId: string, phase: TripPhase): Promise<void> => {
    const { error } = await supabase.from('trips').update({ phase }).eq('id', tripId);
    if (error) throw error;
  }
};
