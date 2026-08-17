import type { AppNotification } from '@/types';
import { ROUTES } from '@/app/routes';

export const getNotificationDestination = (notification: AppNotification): string | null => {
  let { type, metadata } = notification;
  
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata);
    } catch (e) {
      metadata = {};
    }
  }

  if (!metadata?.tripId) return null;
  const tripId = metadata.tripId;

  switch (type) {
    case 'trip_invite':
    case 'trip_member_joined':
    case 'trip_updated':
    case 'decision_reached':
      return ROUTES.TRIP_DASHBOARD(tripId);
    case 'vote_cast':
    case 'vote_changed':
    case 'poll_created':
      return ROUTES.TRIP_DECISIONS(tripId);
    case 'activity_added':
    case 'activity_updated':
    case 'itinerary_updated':
      return ROUTES.TRIP_PLANNER(tripId);
    case 'ai_recommendation_ready':
      return ROUTES.TRIP_DISCOVERY(tripId);
    default:
      return null;
  }
};
