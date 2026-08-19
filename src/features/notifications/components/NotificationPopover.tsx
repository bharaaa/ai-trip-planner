import React from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationList } from './NotificationList';

export interface NotificationPopoverProps {
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ onClose }) => {
  const { notifications, markAllAsRead } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col h-full max-h-[inherit]">
      <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-white text-lg tracking-tight">Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-xs text-accent-400 hover:text-accent-300 font-bold tracking-[0.15em] uppercase transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="overflow-y-auto flex-1">
        <NotificationList onClose={onClose} />
      </div>
    </div>
  );
};
