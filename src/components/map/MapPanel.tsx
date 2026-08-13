import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryItem } from '@/types';

interface MapPanelProps {
  destination?: string;
  activities?: ItineraryItem[];
  className?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({ destination, activities = [], className }) => {
  return (
    <div className={cn("w-full h-full min-h-[400px] rounded-2xl overflow-hidden relative bg-gradient-to-br from-warm-100 to-warm-200 flex items-center justify-center border border-warm-200/50", className)}>
      {/* Abstract map lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Grid pattern */}
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-warm-500" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Activity Pills */}
      <div className="absolute inset-0 w-full h-full opacity-80 pointer-events-none">
        {activities.slice(0, 5).map((activity, i) => (
          <div 
            key={activity.id} 
            className="absolute bg-white px-2 py-1 rounded-full text-[10px] font-medium text-warm-700 shadow-sm border border-warm-200 flex items-center gap-1"
            style={{
              top: `${20 + (i * 15)}%`,
              left: `${15 + (i * 12) + (i % 2 === 0 ? 10 : 0)}%`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
            {activity.location || activity.title}
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center px-8 py-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white max-w-[80%]">
        <h3 className="text-xl font-semibold text-warm-900 mb-2">
          {destination ? destination : 'Map'}
        </h3>
        <p className="text-sm text-warm-600 font-medium">
          Map coming soon
        </p>
      </div>
    </div>
  );
};
