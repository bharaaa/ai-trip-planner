export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type TripStatus = 'draft' | 'discovering' | 'planning' | 'ready' | 'completed';
export type TripPhase = 'discover' | 'plan';

export interface Trip {
  id: string;
  name: string;
  status: TripStatus;
  phase: TripPhase;
  createdAt: Date;
  updatedAt: Date;
  origin: string;
  startDate?: Date;
  endDate?: Date;
  flexibleDates: boolean;
  dateMonth?: string;
  duration?: number;
  budgetPerPerson?: number;
  totalBudget?: number;
  currency: string;
  budgetFlexibility: number;
  travelConstraints?: string;
  travelers: number;
  members: TripMember[];
  preferences: Preference[];
  tripIdeas: TripIdea[];
  reactions: TripReaction[];
  selectedDestination?: Destination;
  itinerary?: Itinerary;
  decisions: Decision[];
  tasks: Task[];
  expenses: Expense[];
  activities?: TripActivity[];
  progress?: number;
  memberCount?: number;
}

export type NotificationType = 
  | 'trip_invite'
  | 'trip_member_joined'
  | 'trip_removed'
  | 'trip_updated'
  | 'poll_created'
  | 'vote_cast'
  | 'vote_changed'
  | 'decision_reached'
  | 'activity_added'
  | 'activity_updated'
  | 'activity_suggested'
  | 'itinerary_updated'
  | 'ai_recommendation_ready'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  message?: string;
  metadata: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export type TripActivityType = 
  | 'trip_created' | 'trip_updated' | 'trip_dates_changed' | 'trip_destination_changed'
  | 'member_joined' | 'member_left' | 'member_removed' | 'member_role_changed' | 'member_invited' | 'invitation_cancelled' | 'member_rejected'
  | 'destination_added' | 'destination_removed' | 'ai_recommendations_generated' | 'destination_shortlisted'
  | 'vote_started' | 'vote_cast' | 'vote_changed' | 'voting_completed' | 'destination_selected'
  | 'itinerary_created' | 'activity_added' | 'activity_updated' | 'activity_removed' | 'activity_moved' | 'day_added' | 'day_removed'
  | 'preference_updated' | 'budget_updated' | 'trip_settings_updated'
  | 'trip_archived' | 'trip_restored'
  // Legacy support
  | 'MEMBER_JOINED' | 'DATES_CHANGED' | 'DESTINATION_SELECTED' | 'POLL_CREATED' | 'POLL_DECIDED' | 'POLL_CLOSED' | 'ITINERARY_UPDATED' | 'PREFERENCES_SUBMITTED' | 'MEMBER_REMOVED' | 'MEMBER_LEFT' | 'MEMBER_INVITED' | 'MEMBER_REJECTED' | 'INVITATION_CANCELLED';

export interface TripActivity {
  id: string;
  tripId: string;
  type: TripActivityType;
  actorId?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TripMember {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'member';
  status: 'invited' | 'joined';
  joinedAt: Date;
  preferencesSubmitted: boolean;
}

export type PreferenceCategory = 'beach' | 'food' | 'nature' | 'culture' | 'nightlife' | 'adventure' | 'cafes' | 'shopping';

export interface Preference {
  userId: string;
  categories: Record<PreferenceCategory, number>;
  pace: number;
  budgetPreference: number;
  travelTolerance: number;
  morningPreference: number;
}

export interface TripIdea {
  id: string;
  destination: string;
  country: string;
  countryCode: string;
  title: string;
  summary: string;
  estimatedBudget: {
    min: number;
    max: number;
    currency: string;
  };
  fitScore: number;
  reasons: string[];
  highlights: string[];
  tradeoffs: string[];
  suggestedDuration: number;
  travelStyle: string;
  keyActivities: string[];
  confidence: number;
  imageUrl?: string;
  isSaved?: boolean;
}

export type ReactionType = 'love' | 'maybe' | 'nope' | 'save' | 'hide';
export type NegativeReason = 'too_expensive' | 'too_crowded' | 'too_much_travel' | 'not_interested' | 'doesnt_fit_group' | 'other';

export interface TripReaction {
  userId: string;
  userName: string;
  tripIdeaId: string;
  reaction: ReactionType;
  reason?: NegativeReason | (string & {});
}

export interface Destination {
  name: string;
  country: string;
  countryCode: string;
  imageUrl?: string;
  selectedAt: Date;
}

export type ActivityType = 'arrival' | 'departure' | 'accommodation' | 'food' | 'beach' | 'nature' | 'culture' | 'adventure' | 'shopping' | 'nightlife' | 'transport' | 'free_time' | 'custom';

export interface ItineraryItem {
  id: string;
  time?: string;
  title: string;
  description?: string;
  type: ActivityType;
  location?: string;
  duration?: number;
  isAIGenerated: boolean;
  isMustDo: boolean;
  notes?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: Date;
  title?: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  days: ItineraryDay[];
  generatedAt: Date;
  isAIDraft: boolean;
}

export interface ItineraryInsight {
  id: string;
  type: 'warning' | 'info' | 'suggestion';
  message: string;
  severity: 'low' | 'medium' | 'high';
  relatedItemIds?: string[];
  suggestion?: string;
}

export type DecisionStatus = 'open' | 'voting' | 'decided' | 'deferred';
export type DecisionType = 'destination' | 'dates' | 'accommodation' | 'transportation' | 'activity' | 'restaurant' | 'budget' | 'itinerary_change';

export interface DecisionOption {
  id: string;
  title: string;
  description?: string;
  votes: { userId: string; vote: 'for' | 'against' | 'neutral' }[];
  metadata?: Record<string, unknown>;
}

export interface Decision {
  id: string;
  type: DecisionType;
  title: string;
  description?: string;
  status: DecisionStatus;
  options: DecisionOption[];
  participants: string[];
  deadline?: Date;
  decidedOption?: string;
  createdAt: Date;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: Date;
  status: TaskStatus;
  relatedDecisionId?: string;
  completedAt?: Date;
}

export interface ExpenseParticipant {
  userId: string;
  userName: string;
  share: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  paidByName: string;
  participants: ExpenseParticipant[];
  date: Date;
  category?: string;
}

export interface TripContext {
  travelers: number;
  origin: string;
  duration?: number;
  budgetPerPerson?: number;
  preferences: Record<PreferenceCategory, number>;
  pace?: number;
  dateMonth?: string;
  flexibleDates: boolean;
  constraints?: string;
}

export interface GroupPreferenceSummary {
  topPreferences: { category: PreferenceCategory; score: number; voterCount: number }[];
  conflicts: { category: PreferenceCategory; divergence: number }[];
  overallPace: number;
  overallBudget: number;
}
