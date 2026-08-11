import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { ItineraryItem } from '@/types';

interface MapPanelProps {
  destination?: string;
  activities?: ItineraryItem[];
  className?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({ destination, activities, className }) => {
  return (
    <div className={cn("w-full h-full min-h-[400px] rounded-2xl overflow-hidden relative bg-gradient-to-br from-warm-100 to-warm-50 flex items-center justify-center border border-warm-200", className)}>
      {/* Abstract map lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0 20 Q 25 30, 50 10 T 100 40 L 100 100 L 0 100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-warm-400" />
        <path d="M0 40 Q 30 60, 60 30 T 100 70" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-warm-400" />
        <path d="M0 60 Q 40 80, 70 50 T 100 90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-warm-400" />
      </svg>
      
      {/* Map pins layer */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <div className="absolute top-[30%] left-[40%] w-3 h-3 bg-accent-400 rounded-full shadow-[0_0_15px_rgba(224,122,95,0.5)] animate-pulse" />
        <div className="absolute top-[45%] left-[60%] w-2.5 h-2.5 bg-accent-300 rounded-full" />
        <div className="absolute top-[60%] left-[35%] w-2 h-2 bg-accent-300 rounded-full" />
        <div className="absolute top-[25%] left-[65%] w-2 h-2 bg-accent-300 rounded-full" />
      </div>

      <div className="relative z-10 text-center px-6 py-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white max-w-[80%]">
        <div className="w-12 h-12 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <h3 className="text-lg font-semibold text-warm-900 mb-1">
          {destination ? `Map of ${destination}` : 'Interactive Map'}
        </h3>
        <p className="text-sm text-warm-500">
          Map integration coming soon. You'll be able to see all your activities and routes here.
        </p>
      </div>
    </div>
  );
};
