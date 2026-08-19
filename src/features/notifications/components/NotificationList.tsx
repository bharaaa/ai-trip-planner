import React from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem } from './NotificationItem';
import { NotificationEmptyState } from './NotificationEmptyState';
import { isToday, isYesterday } from 'date-fns';
import type { AppNotification } from '@/types';

export interface NotificationListProps {
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { notifications, isLoading } = useNotificationStore();

  if (isLoading && notifications.length === 0) {
    return (
      <div className="p-5 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/5" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState onClose={onClose} />;
  }

  // Group notifications
  const today: AppNotification[] = [];
  const yesterday: AppNotification[] = [];
  const earlier: AppNotification[] = [];

  notifications.forEach(n => {
    if (isToday(n.createdAt)) today.push(n);
    else if (isYesterday(n.createdAt)) yesterday.push(n);
    else earlier.push(n);
  });

  const renderGroup = (title: string, items: AppNotification[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-0">
        <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white/30 bg-warm-950/95 backdrop-blur-md sticky top-0 z-10 border-b border-white/5 border-t first:border-t-0">
          {title}
        </div>
        <div className="flex flex-col">
          {items.map(n => (
            <NotificationItem key={n.id} notification={n} onClose={onClose} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-0 bg-transparent">
      {renderGroup('Today', today)}
      {renderGroup('Yesterday', yesterday)}
      {renderGroup('Earlier', earlier)}
    </div>
  );
};
