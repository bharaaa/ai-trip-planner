import React from 'react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Users, Heart, Map, Sparkles, Settings, Calendar, Utensils, Info } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { getNotificationDestination } from '../utils/routing';
import { clsx } from 'clsx';
import type { AppNotification } from '@/types';

export interface NotificationItemProps {
  notification: AppNotification;
  onClose?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'trip_member_joined':
    case 'trip_invite':
      return <Users className="w-5 h-5 text-accent-500" />;
    case 'decision_reached':
      return <Heart className="w-5 h-5 text-error-500" />; // Heart or Star
    case 'vote_cast':
    case 'vote_changed':
    case 'poll_created':
      return <Heart className="w-5 h-5 text-accent-400" />;
    case 'activity_added':
    case 'activity_updated':
    case 'activity_suggested':
    case 'itinerary_updated':
      return <Utensils className="w-5 h-5 text-warm-600" />;
    case 'ai_recommendation_ready':
      return <Sparkles className="w-5 h-5 text-accent-600" />;
    case 'trip_updated':
      return <Calendar className="w-5 h-5 text-warm-500" />;
    case 'system':
    case 'trip_removed':
      return <Settings className="w-5 h-5 text-warm-400" />;
    default:
      return <Info className="w-5 h-5 text-warm-400" />;
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
      className={clsx(
        "w-full text-left px-5 py-4 transition-colors flex items-start gap-4 border-b border-warm-100/50 last:border-0 relative",
        isUnread ? "bg-accent-50/30 hover:bg-accent-50/60" : "bg-white hover:bg-warm-50/50"
      )}
    >
      {/* Unread dot indicator */}
      {isUnread && (
        <span className="absolute left-2.5 top-6 w-1.5 h-1.5 rounded-full bg-accent-500" />
      )}

      {/* Icon Area */}
      <div className="shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center bg-warm-100/50">
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <p className={clsx(
          "text-sm tracking-tight mb-0.5",
          isUnread ? "text-warm-900 font-semibold" : "text-warm-800 font-medium"
        )}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-sm text-warm-500 leading-snug line-clamp-2">
            {notification.message}
          </p>
        )}
        <span className="text-[11px] text-warm-400 mt-1.5 block font-medium uppercase tracking-wider">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </span>
      </div>
    </button>
  );
};
