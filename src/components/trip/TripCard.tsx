import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
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
    <Card 
      variant="interactive" 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col p-0 border-0 bg-white ring-1 ring-warm-200/50",
        className
      )}
    >
      {/* Image Header */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-warm-100">
        {bgImage ? (
          <img 
            src={bgImage} 
            alt={trip.name} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className={cn(
            "absolute inset-0 w-full h-full opacity-90 transition-transform duration-700 ease-out group-hover:scale-105", 
            isAdmin ? "bg-gradient-to-br from-accent-400 to-warm-600" : "bg-gradient-to-br from-blue-400 to-indigo-600"
          )} />
        )}
        
        {/* Overlay gradient so text/badges pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4">
          <Badge variant={trip.status === 'ready' ? 'success' : (trip.status === 'discovering' || trip.status === 'planning' ? 'accent' : 'default')} className="shadow-md backdrop-blur-md bg-white/95 border-0 font-bold">
            {statusLabels[trip.status] || trip.status}
          </Badge>
        </div>

        <div className="absolute top-4 left-4">
           {isAdmin ? (
             <Badge variant="accent" className="text-[10px] uppercase py-1 px-2.5 bg-accent-500/95 text-white border-0 shadow-md backdrop-blur-md font-bold tracking-wider flex items-center gap-1.5">
               <Crown className="w-3 h-3" /> Organizer
             </Badge>
           ) : (
             <Badge variant="default" className="text-[10px] uppercase py-1 px-2.5 bg-blue-500/95 text-white border-0 shadow-md backdrop-blur-md font-bold tracking-wider flex items-center gap-1.5">
               <Users className="w-3 h-3" /> Invited
             </Badge>
           )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-warm-900 leading-tight mb-1.5 group-hover:text-accent-600 transition-colors line-clamp-1">
            {trip.name}
          </h3>
          <p className="text-sm font-medium text-warm-600 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-warm-500" />
            <span className="truncate">{trip.selectedDestination?.name || 'Still dreaming up where to go...'}</span>
          </p>
        </div>
        
        <div className="flex justify-between items-center mt-auto bg-warm-50/50 p-3 rounded-xl border border-warm-100/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-warm-400 font-bold uppercase tracking-wider mb-0.5">Dates</span>
            <span className="font-semibold text-warm-800 text-sm">{trip.flexibleDates ? `Sometime in ${trip.dateMonth || 'the future'}` : 'Locked In'}</span>
          </div>
          <div className="w-px h-6 bg-warm-200"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-warm-400 font-bold uppercase tracking-wider mb-0.5">Crew</span>
            <span className="font-semibold text-warm-800 text-sm">{trip.travelers} people</span>
          </div>
        </div>

        {/* Footer (Progress & Avatars) */}
        <div className="pt-4 mt-4 border-t border-warm-100 flex justify-between items-center">
          <div className="flex-1 mr-6">
             <div className="flex justify-between items-end text-[10px] uppercase font-bold tracking-wider text-warm-400 mb-1.5">
               <span>{trip.phase === 'discover' ? 'Brainstorming' : 'Planning Details'}</span>
               <span className={isAdmin ? "text-accent-600" : "text-blue-600"}>{Math.round(trip.progress || 0)}%</span>
             </div>
             <div className="h-1.5 w-full bg-warm-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    isAdmin ? "bg-gradient-to-r from-accent-400 to-accent-500" : "bg-gradient-to-r from-blue-400 to-blue-500"
                  )}
                  style={{ width: `${trip.progress || 0}%` }}
                />
             </div>
          </div>
          
          <div className="flex items-center shrink-0">
            <MemberAvatars members={trip.members} size="sm" className="-space-x-2 shadow-sm" />
          </div>
        </div>
      </div>
    </Card>
  );
}
