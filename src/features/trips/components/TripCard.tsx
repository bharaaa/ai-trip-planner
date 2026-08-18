import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { MemberAvatars } from './MemberAvatars';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/authStore';
import { Crown, Users, MapPin } from 'lucide-react';

import type { Trip } from '@/types';
export interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  className?: string;
}

export function TripCard({ trip, onClick, className }: TripCardProps) {
  const { user: currentUser } = useAuthStore();
  const currentUserRole = trip.members.find(m => m.userId === currentUser?.id)?.role;
  const isAdmin = currentUserRole === 'admin';
  
  // Find background image
  const bgImage = trip.selectedDestination?.imageUrl || trip.tripIdeas?.[0]?.imageUrl;

  const statusLabels: Record<string, string> = {
    draft: 'Just Started',
    discovering: 'Swiping Ideas',
    planning: 'Building Itinerary',
    ready: 'Ready to Go!',
    completed: 'Finished',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] h-[360px] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/10 flex flex-col",
        className
      )}
    >
      {/* Background Image */}
      <div className={cn(
        "absolute inset-0 w-full h-full bg-warm-900",
        isAdmin ? "bg-gradient-to-br from-accent-600 to-warm-800" : "bg-gradient-to-br from-blue-600 to-indigo-900"
      )}>
        {bgImage && (
          <img 
            src={bgImage} 
            alt={trip.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>
      
      {/* Overlay gradient so text pops */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/90 pointer-events-none" />

      {/* Top Badges */}
      <div className="relative z-10 flex justify-between p-5">
        <Badge variant={trip.status === 'ready' ? 'success' : 'accent'} className="shadow-md backdrop-blur-md bg-white/10 text-white border border-white/20 font-bold tracking-wide">
          {statusLabels[trip.status] || trip.status}
        </Badge>

        {isAdmin ? (
          <div className="w-8 h-8 rounded-full bg-accent-500/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20" title="Organizer">
            <Crown className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20" title="Invited">
            <Users className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Bottom Content */}
      <div className="relative z-10 p-6 flex flex-col mt-auto transform transition-transform duration-500">
        <div className="mb-2">
          <h3 className="text-3xl font-bold text-white leading-tight mb-2 group-hover:text-accent-300 transition-colors line-clamp-2 tracking-tight shadow-sm">
            {trip.name}
          </h3>
          <p className="text-sm font-medium text-warm-200 flex items-center gap-1.5 opacity-90">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{trip.selectedDestination?.name || 'Destination TBD'}</span>
          </p>
        </div>
        
        {/* Footer Details */}
        <div className="pt-4 mt-2 flex justify-between items-end border-t border-white/20">
          <div className="flex flex-col">
            <span className="text-[10px] text-warm-300 font-bold uppercase tracking-wider mb-1">Dates</span>
            <span className="font-semibold text-white text-sm">{trip.flexibleDates ? `Sometime in ${trip.dateMonth || 'the future'}` : 'Locked In'}</span>
          </div>
          
          <div className="flex items-center shrink-0">
            <MemberAvatars members={trip.members.filter(m => m.status !== 'invited')} size="sm" className="-space-x-2 shadow-sm border-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
