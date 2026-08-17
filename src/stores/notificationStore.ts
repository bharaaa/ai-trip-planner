import { create } from 'zustand';
import { notificationService } from '@/services/notification/notificationService';
import { useAuthStore } from './authStore';
import type { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeTripInviteNotification: (tripId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const data = await notificationService.getNotifications(user.id);
      set({ notifications: data });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        )
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },

  removeTripInviteNotification: async (tripId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await notificationService.deleteTripInviteNotification(user.id, tripId);
      set(state => ({
        notifications: state.notifications.filter(
          n => !(n.type === 'trip_invite' && n.metadata?.tripId === tripId)
        )
      }));
    } catch (err) {
      console.error('Failed to remove trip invite notification:', err);
    }
  }
}));
