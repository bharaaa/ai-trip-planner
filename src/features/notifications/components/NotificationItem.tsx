import React from 'react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Users, Heart, Map, Sparkles, Settings, Calendar, Utensils, Info } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { getNotificationDestination } from '../utils/routing';
import { cn } from '@/lib/utils/cn';
import type { AppNotification } from '@/types';

export interface NotificationItemProps {
  notification: AppNotification;
  onClose?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'trip_member_joined':
    case 'trip_invite':
      return <Users className="w-5 h-5 text-accent-400" />;
    case 'decision_reached':
      return <Heart className="w-5 h-5 text-accent-500" />;
    case 'vote_cast':
    case 'vote_changed':
    case 'poll_created':
      return <Heart className="w-5 h-5 text-accent-300" />;
    case 'activity_added':
    case 'activity_updated':
    case 'activity_suggested':
    case 'itinerary_updated':
      return <Utensils className="w-5 h-5 text-white/70" />;
    case 'ai_recommendation_ready':
      return <Sparkles className="w-5 h-5 text-accent-400" />;
    case 'trip_updated':
      return <Calendar className="w-5 h-5 text-white/60" />;
    case 'system':
    case 'trip_removed':
      return <Settings className="w-5 h-5 text-white/40" />;
    default:
      return <Info className="w-5 h-5 text-white/40" />;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationStore();

  const handleClick = () => {
    if (!notification.isRead) markAsRead(notification.id);
    const destination = getNotificationDestination(notification);
    if (destination) {
      navigate(destination);
    } else {
      console.log('Notification has no destination. Metadata:', notification.metadata, 'Type:', notification.type);
      toast.error(`Cannot open: Missing link data for ${notification.type}`);
    }
    if (onClose) onClose();
  };

  const isUnread = !notification.isRead;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left px-5 py-4 transition-colors flex items-start gap-4 relative border-b border-white/5 last:border-b-0",
        isUnread ? "bg-white/[0.03] hover:bg-white/[0.06]" : "bg-transparent hover:bg-white/[0.02]"
      )}
    >
      {/* Unread indicator */}
      {isUnread && (
        <span className="absolute left-1.5 top-[26px] w-1.5 h-1.5 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(var(--accent-500),0.5)]" />
      )}

      {/* Icon Area */}
      <div className={cn(
        "shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center border",
        isUnread 
          ? "bg-accent-500/10 border-accent-500/20 shadow-inner" 
          : "bg-white/5 border-white/5"
      )}>
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2 pt-0.5">
        <p className={cn(
          "text-[15px] tracking-tight leading-snug mb-1",
          isUnread ? "text-white font-bold" : "text-white/70 font-medium"
        )}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2">
            {notification.message}
          </p>
        )}
        <span className="text-[10px] text-accent-400/80 mt-2 block font-bold uppercase tracking-widest">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </span>
      </div>
    </button>
  );
};
