import type { TripActivity, TripMember } from '@/types';

export interface VisibilityContext {
  activities: TripActivity[];
  viewerId: string;
  membership?: TripMember;
}

export const getVisibleActivities = ({ activities, viewerId, membership }: VisibilityContext) => {
  // If the user is not a member, they shouldn't see anything (handled by RLS mostly, but good defense in depth)
  if (!membership) {
    return { recent: [], older: [] };
  }

  const isAdmin = membership.role === 'admin';
  const joinedAt = membership.joinedAt ? new Date(membership.joinedAt) : new Date(0); // Fallback if missing

  // Find the exact 'member_joined' or legacy 'MEMBER_JOINED' activity for this user
  const joinActivity = activities.find(
    a => (a.type === 'member_joined' || a.type === 'MEMBER_JOINED') && a.actorId === viewerId
  );
  
  // Use the exact activity time if found, else use membership.joinedAt
  const effectiveJoinTime = joinActivity ? new Date(joinActivity.createdAt) : joinedAt;

  // Filter out any admin-only events here if we have them (e.g. trip_settings_updated)
  const accessibleActivities = activities.filter(activity => {
    // If not admin, hide sensitive activities
    // (Add sensitive activity types here if needed)
    return true; 
  });

  if (isAdmin) {
    // Admins see everything as one big timeline usually, but we can still split it if we want.
    // However, the prompt says "The organizer should see the complete meaningful history of the trip."
    // We will put everything in `recent` for admins so they don't have a "Before you joined" section.
    return {
      recent: accessibleActivities,
      older: []
    };
  }

  // For normal members, split into Since Joined and Before Joined
  const recent: TripActivity[] = [];
  const older: TripActivity[] = [];

  accessibleActivities.forEach(activity => {
    const activityTime = new Date(activity.createdAt);
    if (activityTime >= effectiveJoinTime) {
      recent.push(activity);
    } else {
      older.push(activity);
    }
  });

  return { recent, older };
};
