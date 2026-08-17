import React, { useState, useEffect } from 'react';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { getVisibleActivities } from '../utils/activityVisibility';
import { ActivityItem } from './ActivityItem';
import { Sparkles, History, ChevronDown } from 'lucide-react';
import { activityService } from '@/services/trip/activityService';

export const TripActivityFeed: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { activeTrip } = useTripStore();
  const [showOlder, setShowOlder] = useState(false);

  useEffect(() => {
    if (!activeTrip?.id) return;

    const unsubscribe = activityService.subscribeToActivities(activeTrip.id, (newActivity) => {
      // Append the activity directly to the store
      useTripStore.setState(state => {
        const trips = state.trips.map(t => {
          if (t.id === activeTrip.id) {
            // Deduplicate
            if (t.activities?.some(a => a.id === newActivity.id)) {
              return t;
            }
            return {
              ...t,
              activities: [newActivity, ...(t.activities || [])]
            };
          }
          return t;
        });
        
        return {
          trips,
          activeTrip: trips.find(t => t.id === state.activeTrip?.id) || null
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeTrip?.id]);

  if (!activeTrip || !currentUser) return null;

  const currentMember = activeTrip.members?.find(m => m.userId === currentUser.id);
  
  const { recent, older } = getVisibleActivities({
    activities: activeTrip.activities || [],
    viewerId: currentUser.id,
    membership: currentMember
  });

  const isNewMember = older.length > 0 && currentMember?.role !== 'admin';
  const hasNoActivity = recent.length === 0 && older.length === 0;

  if (hasNoActivity) {
    return (
      <div className="text-center p-8 bg-white rounded-xl border border-warm-200 border-dashed">
        <Sparkles className="w-8 h-8 text-warm-400 mx-auto mb-3" />
        <p className="text-warm-900 font-medium">Your trip starts here ✨</p>
        <p className="text-warm-500 text-sm mt-1">Invite your friends and start planning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contextual Welcome Summary for New Members */}
      {isNewMember && (
        <div className="bg-gradient-to-br from-accent-50 to-white p-6 rounded-2xl border border-accent-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👋</span>
            <h3 className="text-lg font-bold text-accent-900">Welcome to the trip</h3>
          </div>
          <p className="text-accent-800 font-medium mb-2">You're joining a trip that's already underway.</p>
          <p className="text-accent-700 text-sm">Here's what is happening now since you joined.</p>
        </div>
      )}

      {/* Main Recent Activity Timeline */}
      {recent.length > 0 && (
        <div>
          {isNewMember && (
            <h4 className="text-sm font-bold text-warm-500 uppercase tracking-widest mb-6 px-4">
              Since you joined
            </h4>
          )}
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-warm-200 before:via-warm-200 before:to-transparent">
            {recent.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                viewerId={currentUser.id}
                members={activeTrip.members || []}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Older Activity Catch-up */}
      {older.length > 0 && (
        <div className="pt-6 mt-6 border-t border-warm-200 border-dashed">
          {!showOlder ? (
            <div className="bg-warm-50 p-6 rounded-2xl border border-warm-200 flex flex-col items-center text-center">
              <History className="w-6 h-6 text-warm-400 mb-3" />
              <h4 className="text-warm-900 font-bold mb-1">Before you joined</h4>
              <p className="text-warm-600 text-sm mb-4 max-w-sm">
                Your group has already made some progress. You can catch up on what happened earlier.
              </p>
              <button 
                onClick={() => setShowOlder(true)}
                className="flex items-center gap-2 text-sm font-bold text-accent-600 hover:text-accent-700 transition-colors"
              >
                View earlier activity
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-bold text-warm-500 uppercase tracking-widest mb-6 px-4">
                Before you joined
              </h4>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-warm-200 before:via-warm-200 before:to-transparent opacity-75">
                {older.map((activity) => (
                  <ActivityItem 
                    key={activity.id} 
                    activity={activity} 
                    viewerId={currentUser.id}
                    members={activeTrip.members || []}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

