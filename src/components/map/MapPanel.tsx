import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryItem } from '@/types';
import { MapPin } from 'lucide-react';

interface MapPanelProps {
  destination?: string;
  activities?: ItineraryItem[];
  className?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({ destination, activities = [], className }) => {
  return (
    <div className={cn("w-full h-full min-h-[400px] rounded-3xl overflow-hidden relative bg-warm-900 flex items-center justify-center", className)}>
      {/* Abstract dark map grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none" viewBox="0 0 100 100">
        <pattern id="grid-dark" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.3" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-dark)" />
      </svg>
      
      {/* Activity location markers */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {activities.slice(0, 6).map((activity, i) => (
          <div 
            key={activity.id} 
            className="absolute flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/70 border border-white/10 shadow-lg"
            style={{
              top: `${18 + (i * 13)}%`,
              left: `${12 + (i * 11) + (i % 2 === 0 ? 8 : 0)}%`,
            }}
          >
            <span className="w-2 h-2 rounded-full bg-accent-400 shadow-[0_0_8px_rgba(var(--accent-400),0.5)]" />
            {activity.location || activity.title}
          </div>
        ))}
      </div>

      {/* Center placeholder */}
      <div className="relative z-10 text-center px-10 py-12 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 max-w-[80%]">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="text-white/40" size={22} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          {destination || 'Map View'}
        </h3>
        <p className="text-sm text-white/40 font-medium">
          Interactive map coming soon
        </p>
      </div>
    </div>
  );
};
