import type { TripContext, TripIdea, TripReaction, Destination, Itinerary, ItineraryInsight } from '@/types';

export interface AIProvider {
  generateTripIdeas(context: TripContext): Promise<TripIdea[]>;
  refineTripIdeas(context: TripContext, reactions: TripReaction[]): Promise<TripIdea[]>;
  generateItinerary(destination: Destination, context: TripContext): Promise<Itinerary>;
  analyzeItinerary(itinerary: Itinerary, context: TripContext): Promise<ItineraryInsight[]>;
}
