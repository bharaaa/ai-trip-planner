import { notificationService } from '@/services/notification/notificationService';
import { useTripStore } from '@/stores/tripStore';
import type { CreateNotificationPayload } from './notificationFactory';

export const notifyTripMembers = async (
  tripId: string,
  actorId: string,
  notificationBuilder: (memberId: string) => CreateNotificationPayload
) => {
  const trip = useTripStore.getState().trips.find(t => t.id === tripId);
  if (!trip) return;

  const membersToNotify = trip.members.filter(m => m.userId !== actorId && m.status === 'joined');
  if (membersToNotify.length === 0) return;

  const notifications = membersToNotify.map(m => notificationBuilder(m.userId));
  
  try {
    await notificationService.createMultipleNotifications(notifications);
  } catch (err) {
    console.error('Failed to notify trip members:', err);
  }
};
