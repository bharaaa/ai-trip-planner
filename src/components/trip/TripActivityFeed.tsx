import React from 'react';
import { useTripStore } from '@/stores/tripStore';
import { formatDistanceToNow } from 'date-fns';
import type { TripActivity } from '@/types';
import { MapPin, Calendar, CheckSquare, Settings2, Users, FileText } from 'lucide-react';

const getActivityIcon = (type: TripActivity['actionType']) => {
  switch (type) {
    case 'MEMBER_JOINED': return <Users className="w-4 h-4 text-accent-500" />;
    case 'DATES_CHANGED': return <Calendar className="w-4 h-4 text-info-500" />;
    case 'DESTINATION_SELECTED': return <MapPin className="w-4 h-4 text-success-500" />;
    case 'POLL_CREATED': return <CheckSquare className="w-4 h-4 text-warning-500" />;
    case 'POLL_DECIDED': return <CheckSquare className="w-4 h-4 text-success-500" />;
    case 'POLL_CLOSED': return <CheckSquare className="w-4 h-4 text-warm-500" />;
    case 'ITINERARY_UPDATED': return <FileText className="w-4 h-4 text-info-500" />;
    case 'PREFERENCES_SUBMITTED': return <Settings2 className="w-4 h-4 text-accent-500" />;
    default: return <div className="w-2 h-2 rounded-full bg-warm-400" />;
  }
};

const getActivityMessage = (activity: TripActivity, memberName: string) => {
  const { actionType, details } = activity;
  const name = memberName || 'Someone';

  switch (actionType) {
    case 'MEMBER_JOINED':
      return <span><strong>{details.name || name}</strong> joined the trip</span>;
    case 'DATES_CHANGED':
      return <span><strong>{name}</strong> updated the trip dates</span>;
    case 'DESTINATION_SELECTED':
      return <span><strong>{name}</strong> selected <strong>{details.destination}</strong> as the destination</span>;
    case 'POLL_CREATED':
      return <span><strong>{name}</strong> created a new poll: <em>{details.title}</em></span>;
    case 'POLL_DECIDED':
      return <span><strong>{name}</strong> concluded the poll <em>{details.title}</em> with <strong>{details.winner}</strong></span>;
    case 'POLL_CLOSED':
      return <span><strong>{name}</strong> closed the poll <em>{details.title}</em> without a decision</span>;
    case 'ITINERARY_UPDATED':
      return <span><strong>{name}</strong> generated the itinerary</span>;
    case 'PREFERENCES_SUBMITTED':
      return <span><strong>{name}</strong> submitted their travel preferences</span>;
    default:
      return <span><strong>{name}</strong> performed an action</span>;
  }
};

export const TripActivityFeed: React.FC = () => {
  const { activeTrip } = useTripStore();

  if (!activeTrip) return null;

  const activities = activeTrip.activities || [];

  if (activities.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-xl border border-warm-200 border-dashed">
        <p className="text-warm-500">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-warm-200 before:to-transparent">
      {activities.map((activity) => {
        const member = activeTrip.members?.find(m => m.userId === activity.userId);
        const memberName = member?.name || 'System';

        return (
          <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-warm-50 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {getActivityIcon(activity.actionType)}
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <time className="text-[10px] font-semibold text-warm-400 uppercase tracking-wider">
                  {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                </time>
              </div>
              <div className="text-sm text-warm-800 leading-relaxed">
                {getActivityMessage(activity, memberName)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
