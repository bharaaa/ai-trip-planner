import React from 'react';
import { toast } from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { getNotificationDestination } from '../utils/routing';
import { useNotificationStore } from '@/stores/notificationStore';
import type { AppNotification } from '@/types';

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
      } max-w-md w-full bg-white shadow-xl rounded-[1.25rem] pointer-events-auto flex ring-1 ring-black/5 cursor-pointer hover:bg-warm-50 transition-colors border border-warm-100/50`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-warm-900">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-warm-500">
                {notification.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  ), { duration: 4000 });
};
