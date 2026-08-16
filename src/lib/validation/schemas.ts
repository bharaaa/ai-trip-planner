import { z } from 'zod';

export const TripIdeaSchema = z.object({
  id: z.string(),
  destination: z.string(),
  country: z.string(),
  countryCode: z.string(),
  title: z.string(),
  summary: z.string(),
  estimatedBudget: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }),
  fitScore: z.number(),
  reasons: z.array(z.string()),
  highlights: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  suggestedDuration: z.number(),
  travelStyle: z.string(),
  keyActivities: z.array(z.string()),
  confidence: z.number(),
  imageUrl: z.string().optional(),
});

export const ActivityTypeSchema = z.enum([
  'arrival', 'departure', 'accommodation', 'food', 'beach', 
  'nature', 'culture', 'adventure', 'shopping', 'nightlife', 
  'transport', 'free_time', 'custom'
]);

export const ItineraryItemSchema = z.object({
  id: z.string(),
  time: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  type: ActivityTypeSchema,
  location: z.string().optional(),
  duration: z.number().optional(),
  isAIGenerated: z.boolean(),
  isMustDo: z.boolean(),
  notes: z.string().optional(),
});

export const ItineraryDaySchema = z.object({
  dayNumber: z.number(),
  date: z.date().optional(),
  title: z.string().optional(),
  items: z.array(ItineraryItemSchema),
});

export const ItinerarySchema = z.object({
  days: z.array(ItineraryDaySchema),
  generatedAt: z.date(),
  isAIDraft: z.boolean(),
});

export const DecisionTypeSchema = z.enum([
  'destination', 'dates', 'accommodation', 'transportation', 
  'activity', 'restaurant', 'budget', 'itinerary_change'
]);

export const DecisionStatusSchema = z.enum([
  'open', 'voting', 'decided', 'deferred'
]);

export const DecisionOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  votes: z.array(z.object({
    userId: z.string(),
    vote: z.enum(['for', 'against', 'neutral']),
  })),
  metadata: z.any().optional(),
});

export const DecisionSchema = z.object({
  id: z.string(),
  type: DecisionTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  status: DecisionStatusSchema,
  options: z.array(DecisionOptionSchema),
  participants: z.array(z.string()),
  deadline: z.date().optional(),
  decidedOption: z.string().optional(),
  createdAt: z.date(),
});

export const PreferenceCategorySchema = z.enum([
  'beach', 'food', 'nature', 'culture', 'nightlife', 'adventure', 'cafes', 'shopping'
]);

export const TripContextSchema = z.object({
  travelers: z.number(),
  origin: z.string(),
  duration: z.number().optional(),
  budgetPerPerson: z.number().optional(),
  preferences: z.record(PreferenceCategorySchema, z.number()),
  pace: z.number().optional(),
  dateMonth: z.string().optional(),
  flexibleDates: z.boolean(),
  constraints: z.string().optional(),
});

