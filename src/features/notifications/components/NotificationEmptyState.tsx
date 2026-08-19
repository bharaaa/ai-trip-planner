import React from 'react';
import { Sparkles } from 'lucide-react';

export interface NotificationEmptyStateProps {
  onClose: () => void;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ onClose }) => {
  return (
    <div className="py-16 px-8 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-accent-400" />
      </div>
      <p className="text-white font-bold text-lg mb-1 tracking-tight">You're all caught up ✨</p>
      <p className="text-white/40 text-[13px] max-w-[200px] leading-relaxed">
        Nothing new here. Go enjoy the trip planning.
      </p>
    </div>
  );
};
