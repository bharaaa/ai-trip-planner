import React from 'react';
import { useTripStore } from '@/stores/tripStore';
import { formatDistanceToNow, format } from 'date-fns';
import type { TripActivity } from '@/types';
import { MapPin, Calendar, CheckSquare, Settings2, Users, FileText, UserMinus, LogOut } from 'lucide-react';

const getActivityIcon = (type: TripActivity['actionType']) => {
  switch (type) {
    case 'MEMBER_JOINED': return { icon: <Users className="w-5 h-5 text-accent-700" />, bg: 'bg-accent-100' };
    case 'MEMBER_INVITED': return { icon: <Users className="w-5 h-5 text-info-700" />, bg: 'bg-info-100' };
    case 'MEMBER_REMOVED': return { icon: <UserMinus className="w-5 h-5 text-error-700" />, bg: 'bg-error-100' };
    case 'MEMBER_REJECTED': return { icon: <X className="w-5 h-5 text-warm-600" />, bg: 'bg-warm-200' };
    case 'INVITATION_CANCELLED': return { icon: <X className="w-5 h-5 text-warm-500" />, bg: 'bg-warm-100' };
    case 'MEMBER_LEFT': return { icon: <LogOut className="w-5 h-5 text-warm-600 ml-1" />, bg: 'bg-warm-200' };
    case 'DATES_CHANGED': return { icon: <Calendar className="w-5 h-5 text-info-700" />, bg: 'bg-info-100' };
    case 'DESTINATION_SELECTED': return { icon: <MapPin className="w-5 h-5 text-success-700" />, bg: 'bg-success-100' };
    case 'POLL_CREATED': return { icon: <CheckSquare className="w-5 h-5 text-warning-700" />, bg: 'bg-warning-100' };
    case 'POLL_DECIDED': return { icon: <CheckSquare className="w-5 h-5 text-success-700" />, bg: 'bg-success-100' };
    case 'POLL_CLOSED': return { icon: <CheckSquare className="w-5 h-5 text-warm-600" />, bg: 'bg-warm-200' };
    case 'ITINERARY_UPDATED': return { icon: <FileText className="w-5 h-5 text-info-700" />, bg: 'bg-info-100' };
    case 'PREFERENCES_SUBMITTED': return { icon: <Settings2 className="w-5 h-5 text-accent-700" />, bg: 'bg-accent-100' };
    default: return { icon: <div className="w-3 h-3 rounded-full bg-warm-400" />, bg: 'bg-warm-100' };
  }
};

const formatDateDetails = (dates: any) => {
  if (!dates) return 'Unknown dates';
  if (dates.flexibleDates) {
    if (dates.dateMonth) return `Flexible in ${dates.dateMonth}`;
    return 'Flexible dates';
  }
  if (dates.startDate && dates.endDate) {
    return `${format(new Date(dates.startDate), 'MMM d, yyyy')} - ${format(new Date(dates.endDate), 'MMM d, yyyy')}`;
  }
  return 'Unknown dates';
};

const getActivityMessage = (activity: TripActivity, memberName: string) => {
  const { actionType, details } = activity;
  const name = memberName || 'Someone';

  switch (actionType) {
    case 'MEMBER_JOINED':
      return <span><strong>{details.name || name}</strong> joined the trip</span>;
    case 'MEMBER_INVITED':
      return <span><strong>{name}</strong> invited <strong>{details.name || 'someone'}</strong> to the trip</span>;
    case 'MEMBER_REMOVED':
      return <span><strong>{name}</strong> removed <strong>{details.name || 'a member'}</strong> from the trip</span>;
    case 'MEMBER_REJECTED':
      return <span><strong>{details.name || name}</strong> declined the trip invitation</span>;
    case 'INVITATION_CANCELLED':
      return <span><strong>{name}</strong> cancelled the invitation for <strong>{details.name || 'someone'}</strong></span>;
    case 'MEMBER_LEFT':
      return <span><strong>{details.name || name}</strong> left the trip</span>;
    case 'DATES_CHANGED': {
      if (details.newDates) {
        const oldStr = formatDateDetails(details.oldDates);
        const newStr = formatDateDetails(details.newDates);
        return <span><strong>{name}</strong> updated the trip dates from <strong>{oldStr}</strong> to <strong>{newStr}</strong></span>;
      }
      return <span><strong>{name}</strong> updated the trip dates to <strong>{formatDateDetails(details)}</strong></span>;
    }
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
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-warm-200 before:via-warm-200 before:to-transparent">
      {activities.map((activity) => {
        const member = activeTrip.members?.find(m => m.userId === activity.userId);
        const memberName = member?.name || 'System';
        const { icon, bg } = getActivityIcon(activity.actionType);

        return (
          <div key={activity.id} className="relative flex items-start gap-5 group">
            {/* Timeline Node */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${bg} shadow-sm shrink-0 z-10`}>
              {icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 bg-white p-5 rounded-2xl border border-warm-200/60 shadow-sm hover:border-warm-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <time className="text-[11px] font-bold text-warm-500 uppercase tracking-widest">
                  {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                </time>
              </div>
              <div className="text-base text-warm-900 leading-relaxed font-medium">
                {getActivityMessage(activity, memberName)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
