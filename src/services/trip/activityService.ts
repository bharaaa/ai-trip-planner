import { supabase } from '@/lib/supabase';
import type { TripActivity, ActionType } from '@/types';

export const activityService = {
  getActivities: async (tripId: string): Promise<TripActivity[]> => {
    const { data, error } = await supabase
      .from('trip_activities')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, return empty
        return [];
      }
      console.error('Failed to fetch activities:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      tripId: item.trip_id,
      userId: item.user_id,
      actionType: item.action_type as ActionType,
      details: item.details,
      createdAt: new Date(item.created_at)
    }));
  },

  logActivity: async (tripId: string, userId: string | undefined, actionType: ActionType, details: Record<string, any> = {}): Promise<TripActivity | null> => {
    const payload = {
      trip_id: tripId,
      user_id: userId || null,
      action_type: actionType,
      details
    };

    const { data, error } = await supabase
      .from('trip_activities')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, ignore
        return null;
      }
      console.error('Failed to log activity:', error);
      return null;
    }

    return {
      id: data.id,
      tripId: data.trip_id,
      userId: data.user_id,
      actionType: data.action_type as ActionType,
      details: data.details,
      createdAt: new Date(data.created_at)
    };
  }
};
