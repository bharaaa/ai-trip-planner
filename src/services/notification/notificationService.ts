import { supabase } from '@/lib/supabase';
import type { AppNotification } from '@/types';

export const notificationService = {
  getNotifications: async (userId: string): Promise<AppNotification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      actorId: n.actor_id,
      type: n.type,
      title: n.title,
      message: n.message,
      metadata: n.metadata || {},
      isRead: n.is_read,
      createdAt: new Date(n.created_at)
    }));
  },

  createNotification: async (notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        actor_id: notification.actorId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata
      });

    if (error) throw error;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  deleteTripInviteNotification: async (userId: string, tripId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('type', 'trip_invite')
      .contains('metadata', { tripId });

    if (error) throw error;
  }
};
