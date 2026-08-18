import React from 'react';
import { toast } from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { getNotificationDestination } from '../utils/routing';
import { useNotificationStore } from '@/stores/notificationStore';
import type { AppNotification } from '@/types';
import { Bell, ChevronRight } from 'lucide-react';

export const showNotificationToast = (notification: AppNotification, navigate: ReturnType<typeof useNavigate>) => {
  toast.custom((t: Toast) => (
    <div
      onClick={() => {
        toast.dismiss(t.id);
        useNotificationStore.getState().markAsRead(notification.id);
        const dest = getNotificationDestination(notification);
        if (dest) navigate(dest);
      }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-warm-950/95 backdrop-blur-xl text-white shadow-2xl rounded-2xl pointer-events-auto flex items-center p-4 cursor-pointer hover:bg-black transition-colors border border-warm-800/50`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warm-800/50 flex items-center justify-center border border-warm-700/50">
        <Bell size={18} className="text-warm-300" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-bold text-white tracking-wide">
          {notification.title}
        </p>
        {notification.message && (
          <p className="mt-0.5 text-xs text-warm-300 line-clamp-1 font-medium">
            {notification.message}
          </p>
        )}
      </div>
      <div className="ml-3 flex-shrink-0">
        <ChevronRight size={16} className="text-warm-500 group-hover:text-warm-300 transition-colors" />
      </div>
    </div>
  ), { duration: 5000, position: 'bottom-center' });
};
