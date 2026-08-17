import type { AppNotification } from '@/types';

export type CreateNotificationPayload = Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>;

export const notificationFactory = {
  createTripInvite: (userId: string, actorId: string, tripId: string, tripName: string): CreateNotificationPayload => ({
    userId,
    actorId,
    type: 'trip_invite',
    title: 'Trip Invitation',
    message: `You have been invited to join ${tripName}`,
    metadata: { tripId, tripName }
  }),

  createMemberJoined: (userId: string, actorId: string, actorName: string, tripId: string, tripName: string): CreateNotificationPayload => ({
    userId,
    actorId,
    type: 'trip_member_joined',
    title: 'New Member',
    message: `${actorName} joined the trip`,
    metadata: { tripId, tripName, actorName }
  }),

  createVoteCast: (userId: string, actorId: string, actorName: string, tripId: string, optionTitle: string): CreateNotificationPayload => ({
    userId,
    actorId,
    type: 'vote_cast',
    title: 'New Vote',
    message: `${actorName} voted for ${optionTitle}`,
    metadata: { tripId, optionTitle, actorName }
  }),

  createDecisionReached: (userId: string, tripId: string, tripName: string, decisionTitle: string, optionTitle: string): CreateNotificationPayload => ({
    userId,
    type: 'decision_reached',
    title: 'Decision Reached 🎉',
    message: `Your group picked ${optionTitle} for ${decisionTitle}`,
    metadata: { tripId, tripName, decisionTitle, optionTitle }
  }),

  createActivityAdded: (userId: string, actorId: string, actorName: string, tripId: string, activityTitle: string, dayNumber?: number): CreateNotificationPayload => ({
    userId,
    actorId,
    type: 'activity_added',
    title: 'Itinerary Updated',
    message: `${actorName} added ${activityTitle}${dayNumber ? ` to Day ${dayNumber}` : ''}`,
    metadata: { tripId, activityTitle, dayNumber, actorName }
  }),

  createTripUpdated: (userId: string, actorId: string, actorName: string, tripId: string, changeSummary: string): CreateNotificationPayload => ({
    userId,
    actorId,
    type: 'trip_updated',
    title: 'Trip Updated',
    message: `${actorName} ${changeSummary}`,
    metadata: { tripId, actorName, changeSummary }
  })
};
