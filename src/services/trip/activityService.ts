import { supabase } from '@/lib/supabase';
import type { TripActivity, TripActivityType } from '@/types';

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
      type: (item.type || item.action_type) as TripActivityType, // Handle legacy action_type during migration
      actorId: item.actor_id || item.user_id, // Handle legacy user_id
      entityId: item.entity_id,
      metadata: item.metadata || item.details, // Handle legacy details
      createdAt: item.created_at
    }));
  },

  logActivity: async (
    tripId: string, 
    type: TripActivityType, 
    actorId?: string, 
    metadata: Record<string, any> = {},
    entityId?: string
  ): Promise<TripActivity | null> => {
    const payload = {
      trip_id: tripId,
      actor_id: actorId || null,
      type: type,
      metadata: metadata,
      entity_id: entityId || null
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
      type: data.type as TripActivityType,
      actorId: data.actor_id,
      entityId: data.entity_id,
      metadata: data.metadata,
      createdAt: data.created_at
    };
  },

  subscribeToActivities: (tripId: string, onActivityReceived: (activity: TripActivity) => void) => {
    const channel = supabase
      .channel(`trip_activities:${tripId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_activities', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const item = payload.new;
          onActivityReceived({
            id: item.id,
            tripId: item.trip_id,
            type: (item.type || item.action_type) as TripActivityType,
            actorId: item.actor_id || item.user_id,
            entityId: item.entity_id,
            metadata: item.metadata || item.details,
            createdAt: item.created_at
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
