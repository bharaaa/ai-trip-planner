import React from 'react';
import { Sparkles } from 'lucide-react';

export interface NotificationEmptyStateProps {
  onClose: () => void;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ onClose }) => {
  return (
    <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 bg-white">
      <div className="w-12 h-12 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mb-2">
        <Sparkles className="w-6 h-6" />
      </div>
      <p className="text-warm-900 font-semibold text-base">You're all caught up ✨</p>
      <p className="text-warm-500 text-sm max-w-[200px]">
        Nothing new here. Go enjoy the trip planning.
      </p>
    </div>
  );
};
