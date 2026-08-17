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
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-warm-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-warm-200 rounded w-3/4" />
              <div className="h-3 bg-warm-100 rounded w-1/2" />
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
      <div className="mb-2">
        <div className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-warm-400 bg-white sticky top-0 z-10">
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
    <div className="pb-2 bg-white">
      {renderGroup('Today', today)}
      {renderGroup('Yesterday', yesterday)}
      {renderGroup('Earlier', earlier)}
    </div>
  );
};
