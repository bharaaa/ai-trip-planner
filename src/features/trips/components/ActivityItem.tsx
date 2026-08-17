import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import type { TripActivity, TripMember } from '@/types';
import { MapPin, Calendar, CheckSquare, Settings2, Users, FileText, UserMinus, LogOut, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ActivityItemProps {
  activity: TripActivity;
  viewerId?: string;
  members: TripMember[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'member_joined':
    case 'MEMBER_JOINED': return { icon: <Users className="w-5 h-5 text-accent-700" />, bg: 'bg-accent-100' };
    case 'MEMBER_INVITED': return { icon: <Users className="w-5 h-5 text-info-700" />, bg: 'bg-info-100' };
    case 'member_removed':
    case 'MEMBER_REMOVED': return { icon: <UserMinus className="w-5 h-5 text-error-700" />, bg: 'bg-error-100' };
    case 'MEMBER_REJECTED': return { icon: <X className="w-5 h-5 text-warm-600" />, bg: 'bg-warm-200' };
    case 'INVITATION_CANCELLED': return { icon: <X className="w-5 h-5 text-warm-500" />, bg: 'bg-warm-100' };
    case 'member_left':
    case 'MEMBER_LEFT': return { icon: <LogOut className="w-5 h-5 text-warm-600 ml-1" />, bg: 'bg-warm-200' };
    case 'trip_dates_changed':
    case 'DATES_CHANGED': return { icon: <Calendar className="w-5 h-5 text-info-700" />, bg: 'bg-info-100' };
    case 'destination_selected':
    case 'DESTINATION_SELECTED': return { icon: <MapPin className="w-5 h-5 text-success-700" />, bg: 'bg-success-100' };
    case 'vote_started':
    case 'POLL_CREATED': return { icon: <CheckSquare className="w-5 h-5 text-warning-700" />, bg: 'bg-warning-100' };
    case 'voting_completed':
    case 'POLL_DECIDED': return { icon: <CheckSquare className="w-5 h-5 text-success-700" />, bg: 'bg-success-100' };
    case 'POLL_CLOSED': return { icon: <CheckSquare className="w-5 h-5 text-warm-600" />, bg: 'bg-warm-200' };
    case 'itinerary_created':
    case 'activity_added':
    case 'ITINERARY_UPDATED': return { icon: <FileText className="w-5 h-5 text-info-700" />, bg: 'bg-info-100' };
    case 'preference_updated':
    case 'PREFERENCES_SUBMITTED': return { icon: <Settings2 className="w-5 h-5 text-accent-700" />, bg: 'bg-accent-100' };
    case 'trip_created': return { icon: <Sparkles className="w-5 h-5 text-success-700" />, bg: 'bg-success-100' };
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

const getActivityMessage = (activity: TripActivity, isSelf: boolean, memberName: string) => {
  const { type, metadata = {} } = activity;
  const name = isSelf ? 'You' : memberName;
  const verb = (isSelf && type !== 'trip_created') ? '' : 's'; // grammar heuristic, though we'll hardcode per case to be safe.

  switch (type) {
    case 'trip_created':
      return <span><strong>{name}</strong> created the trip</span>;
    case 'member_joined':
    case 'MEMBER_JOINED':
      if (isSelf) return <span><strong>You</strong> joined the trip</span>;
      return <span><strong>{metadata.name || name}</strong> joined the trip</span>;
    case 'MEMBER_INVITED':
      return <span><strong>{name}</strong> invited <strong>{metadata.name || 'someone'}</strong> to the trip</span>;
    case 'member_removed':
    case 'MEMBER_REMOVED':
      return <span><strong>{name}</strong> removed <strong>{metadata.name || 'a member'}</strong> from the trip</span>;
    case 'MEMBER_REJECTED':
      return <span><strong>{metadata.name || name}</strong> declined the trip invitation</span>;
    case 'INVITATION_CANCELLED':
      return <span><strong>{name}</strong> cancelled the invitation for <strong>{metadata.name || 'someone'}</strong></span>;
    case 'member_left':
    case 'MEMBER_LEFT':
      return <span><strong>{metadata.name || name}</strong> left the trip</span>;
    case 'trip_dates_changed':
    case 'DATES_CHANGED': {
      if (metadata.newDates) {
        const oldStr = formatDateDetails(metadata.oldDates);
        const newStr = formatDateDetails(metadata.newDates);
        return <span><strong>{name}</strong> updated the trip dates from <strong>{oldStr}</strong> to <strong>{newStr}</strong></span>;
      }
      return <span><strong>{name}</strong> updated the trip dates to <strong>{formatDateDetails(metadata)}</strong></span>;
    }
    case 'destination_added':
      return <span><strong>{name}</strong> added <strong>{metadata.destination || 'a destination'}</strong> to the shortlist</span>;
    case 'destination_selected':
    case 'DESTINATION_SELECTED':
      return <span><strong>{name}</strong> selected <strong>{metadata.destination}</strong> as the destination</span>;
    case 'vote_started':
    case 'POLL_CREATED':
      return <span><strong>{name}</strong> started voting for destinations</span>;
    case 'vote_cast':
      return <span><strong>{name}</strong> voted for <strong>{metadata.destination || 'a destination'}</strong></span>;
    case 'voting_completed':
    case 'POLL_DECIDED':
      return <span><strong>Everyone has voted!</strong> {metadata.destination ? `The group selected ${metadata.destination}.` : ''}</span>;
    case 'activity_added':
      return <span><strong>{name}</strong> added <strong>{metadata.activityName || 'an activity'}</strong> to the itinerary</span>;
    case 'itinerary_created':
    case 'ITINERARY_UPDATED':
      return <span><strong>{name}</strong> generated the itinerary</span>;
    case 'preference_updated':
    case 'PREFERENCES_SUBMITTED':
      return <span><strong>{name}</strong> submitted their travel preferences</span>;
    default:
      return <span><strong>{name}</strong> performed an action</span>;
  }
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, viewerId, members }) => {
  const isSelf = activity.actorId === viewerId;
  const member = members.find(m => m.userId === activity.actorId);
  const memberName = member?.name || 'Someone';
  
  const { icon, bg } = getActivityIcon(activity.type);
  const isMilestone = ['trip_created', 'destination_selected', 'DESTINATION_SELECTED', 'voting_completed'].includes(activity.type);

  return (
    <div className="relative flex items-start gap-5 group">
      {/* Timeline Node */}
      <div className={cn(
        `flex items-center justify-center rounded-full shadow-sm shrink-0 z-10 transition-transform`,
        bg,
        isMilestone ? "w-14 h-14 border-4 border-white scale-105" : "w-12 h-12 border-4 border-white"
      )}>
        {icon}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 p-5 rounded-2xl border shadow-sm transition-colors",
        isMilestone ? "bg-accent-50/50 border-accent-200" : "bg-white border-warm-200/60 hover:border-warm-300"
      )}>
        <div className="flex items-center justify-between mb-2">
          <time className="text-[11px] font-bold text-warm-500 uppercase tracking-widest">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </time>
        </div>
        <div className={cn(
          "text-base leading-relaxed font-medium",
          isMilestone ? "text-accent-900" : "text-warm-900"
        )}>
          {getActivityMessage(activity, isSelf, memberName)}
        </div>
      </div>
    </div>
  );
};
