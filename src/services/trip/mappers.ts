import type { Trip, TripIdea, TripReaction, Decision, Itinerary, Preference, TripMember } from '@/types';
import { TripIdeaSchema, ItinerarySchema, DecisionSchema } from '@/lib/validation/schemas';

export function mapTripResponse(data: any[]): Trip[] {
  return data.map(mapSingleTrip);
}

export function mapSingleTrip(t: any): Trip {
  const allReactions: any[] = [];
  
  const mappedIdeas = (t.tripIdeas || []).map((idea: any) => {
    if (idea.reactions) {
      allReactions.push(...idea.reactions.map((r: any) => ({
        ...r,
        tripIdeaId: r.trip_idea_id,
        userId: r.user_id,
      })));
    }
    
    const result = {
      id: idea.id,
      destination: idea.destination,
      country: idea.country,
      countryCode: idea.country_code,
      title: idea.title,
      summary: idea.summary,
      estimatedBudget: {
        min: idea.estimated_budget_min || 0,
        max: idea.estimated_budget_max || 0,
        currency: idea.currency || 'IDR'
      },
      fitScore: idea.fit_score || 0,
      reasons: idea.reasons || [],
      highlights: idea.highlights || [],
      tradeoffs: idea.tradeoffs || [],
      suggestedDuration: idea.suggested_duration || 0,
      travelStyle: idea.travel_style || '',
      keyActivities: idea.key_activities || [],
      confidence: idea.confidence || 0,
      imageUrl: idea.image_url,
      isSaved: idea.is_saved || false,
    };
    
    const parseResult = TripIdeaSchema.safeParse(result);
    if (!parseResult.success) {
      console.warn('TripIdea validation failed:', parseResult.error);
    }
    
    return result;
  });

  const mappedDecisions = (t.decisions || []).map((d: any) => {
    const result = {
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
      metadata: o.metadata,
      votes: (o.votes || []).map((v: any) => ({
        userId: v.user_id,
        vote: v.vote
      }))
    }))
    };
    
    const parseResult = DecisionSchema.safeParse(result);
    if (!parseResult.success) {
      console.warn('Decision validation failed:', parseResult.error);
    }
    
    return result;
  });

  let mappedItinerary = undefined;
  if (t.itineraries && t.itineraries.length > 0) {
    const rawItinerary = t.itineraries[0];
    const sortedDays = (rawItinerary.days || []).sort((a: any, b: any) => a.day_number - b.day_number);
    
    mappedItinerary = {
      isAIDraft: rawItinerary.is_ai_draft,
      generatedAt: rawItinerary.generated_at ? new Date(rawItinerary.generated_at) : undefined,
      days: sortedDays.map((day: any) => {
        const sortedItems = (day.items || []).sort((a: any, b: any) => a.order_index - b.order_index);
        return {
          dayNumber: day.day_number,
          date: day.date ? new Date(day.date) : undefined,
          title: day.title,
          items: sortedItems.map((item: any) => ({
            id: item.id,
            time: item.time,
            title: item.title,
            description: item.description,
            type: item.type,
            location: item.location,
            duration: item.duration,
            isAIGenerated: item.is_ai_generated,
            isMustDo: item.is_must_do,
            notes: item.notes
          }))
        };
      })
    };
    
    const parseResult = ItinerarySchema.safeParse(mappedItinerary);
    if (!parseResult.success) {
      console.warn('Itinerary validation failed:', parseResult.error);
    }
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
    createdAt: new Date(t.created_at),
    updatedAt: new Date(t.updated_at),
    startDate: t.start_date ? new Date(t.start_date) : undefined,
    endDate: t.end_date ? new Date(t.end_date) : undefined,
    dateMonth: t.date_month,
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
  } as Trip;
}
