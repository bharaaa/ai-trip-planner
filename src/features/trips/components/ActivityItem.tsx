import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import type { TripActivity, TripMember } from '@/types';
import { MapPin, Calendar, CheckSquare, Settings2, Users, FileText, UserMinus, LogOut, X, Sparkles, Plus, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ActivityItemProps {
  activity: TripActivity;
  viewerId?: string;
  members: TripMember[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'member_joined':
    case 'MEMBER_JOINED': return { icon: <Users className="w-4 h-4 text-warm-300" />, bg: 'bg-white/10 border-white/20' };
    case 'MEMBER_INVITED': return { icon: <Users className="w-4 h-4 text-warm-400" />, bg: 'bg-white/10 border-white/20' };
    case 'member_removed':
    case 'MEMBER_REMOVED': return { icon: <UserMinus className="w-4 h-4 text-error-400" />, bg: 'bg-error-500/20 border-error-500/30' };
    case 'MEMBER_REJECTED': return { icon: <X className="w-4 h-4 text-warm-400" />, bg: 'bg-white/10 border-white/20' };
    case 'INVITATION_CANCELLED': return { icon: <X className="w-4 h-4 text-warm-400" />, bg: 'bg-white/10 border-white/20' };
    case 'member_left':
    case 'MEMBER_LEFT': return { icon: <LogOut className="w-4 h-4 text-warm-400 ml-0.5" />, bg: 'bg-white/10 border-white/20' };
    case 'trip_dates_changed':
    case 'DATES_CHANGED': return { icon: <Calendar className="w-4 h-4 text-info-400" />, bg: 'bg-info-500/20 border-info-500/30' };
    case 'destination_selected':
    case 'DESTINATION_SELECTED': return { icon: <MapPin className="w-5 h-5 text-success-400" />, bg: 'bg-success-500/20 border-success-500/30', milestone: true };
    case 'vote_started':
    case 'POLL_CREATED': return { icon: <CheckSquare className="w-4 h-4 text-energy-400" />, bg: 'bg-energy-500/20 border-energy-500/30' };
    case 'voting_completed':
    case 'POLL_DECIDED': return { icon: <CheckSquare className="w-5 h-5 text-success-400" />, bg: 'bg-success-500/20 border-success-500/30', milestone: true };
    case 'POLL_CLOSED': return { icon: <CheckSquare className="w-4 h-4 text-warm-400" />, bg: 'bg-white/10 border-white/20' };
    case 'itinerary_created':
    case 'activity_added':
    case 'ITINERARY_UPDATED': return { icon: <Navigation className="w-4 h-4 text-accent-400" />, bg: 'bg-accent-500/20 border-accent-500/30' };
    case 'preference_updated':
    case 'PREFERENCES_SUBMITTED': return { icon: <Settings2 className="w-4 h-4 text-accent-400" />, bg: 'bg-accent-500/20 border-accent-500/30' };
    case 'trip_created': return { icon: <Sparkles className="w-5 h-5 text-accent-400" />, bg: 'bg-accent-500/20 border-accent-500/30', milestone: true };
    default: return { icon: <div className="w-2 h-2 rounded-full bg-warm-500" />, bg: 'bg-white/10 border-white/20' };
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
        return <span><strong>{name}</strong> updated the trip dates from <em className="text-warm-400">{oldStr}</em> to <strong>{newStr}</strong></span>;
      }
      return <span><strong>{name}</strong> updated the trip dates to <strong>{formatDateDetails(metadata)}</strong></span>;
    }
    case 'destination_added':
      return <span><strong>{name}</strong> added <strong>{metadata.destination || 'a destination'}</strong> to the shortlist</span>;
    case 'destination_selected':
    case 'DESTINATION_SELECTED':
      return <span><strong>{name}</strong> locked in <strong>{metadata.destination}</strong> as the destination!</span>;
    case 'vote_started':
    case 'POLL_CREATED':
      return <span><strong>{name}</strong> wants the group to vote on a decision</span>;
    case 'vote_cast':
      return <span><strong>{name}</strong> voted for <strong>{metadata.destination || 'a destination'}</strong></span>;
    case 'voting_completed':
    case 'POLL_DECIDED':
      return <span><strong>Everyone has voted!</strong> {metadata.destination ? `The group chose ${metadata.destination}.` : ''}</span>;
    case 'activity_added':
      return <span><strong>{name}</strong> added <strong>{metadata.activityName || 'an activity'}</strong> to the itinerary</span>;
    case 'itinerary_created':
    case 'ITINERARY_UPDATED':
      return <span><strong>{name}</strong> updated the itinerary</span>;
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
  
  const { icon, bg, milestone } = getActivityIcon(activity.type);

  return (
    <div className="relative flex items-start gap-4 group">
      {/* Timeline Node */}
      <div className={cn(
        `flex items-center justify-center rounded-full shrink-0 z-10 border-[3px]`,
        bg,
        milestone ? "w-12 h-12 shadow-sm" : "w-10 h-10 shadow-xs mt-1"
      )}>
        {icon}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 rounded-2xl transition-colors",
        milestone ? "p-5 bg-white/5 border border-white/10 shadow-sm mb-2 backdrop-blur-xl" : "p-2 py-3 bg-transparent"
      )}>
        <div className={cn(
          "text-[15px] leading-relaxed",
          milestone ? "text-white font-medium" : "text-warm-300"
        )}>
          {getActivityMessage(activity, isSelf, memberName)}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <time className="text-[11px] font-bold text-warm-500 uppercase tracking-widest">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </time>
        </div>
      </div>
    </div>
  );
};
