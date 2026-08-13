import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MemberAvatars } from './MemberAvatars';
import { cn } from '@/lib/utils/cn';

import type { Trip } from '@/types';
export interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  className?: string;
}

export function TripCard({ trip, onClick, className }: TripCardProps) {
  const statusColors: Record<string, "accent" | "success" | "default"> = {
    draft: 'default',
    discovering: 'accent',
    planning: 'accent',
    ready: 'success',
    completed: 'default',
  };

  return (
    <Card 
      variant="interactive" 
      onClick={onClick}
      className={cn("relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 border-l-accent-400", className)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-semibold text-warm-900 mb-1">{trip.name}</h3>
            <p className="text-sm text-warm-500">{trip.selectedDestination?.name || 'Deciding destination...'}</p>
          </div>
          <Badge variant={statusColors[trip.status] || 'default'} className="capitalize">
            {trip.status}
          </Badge>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="flex-1 mr-6">
             <div className="h-1 w-full bg-warm-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-400 rounded-full transition-all duration-500" 
                  style={{ width: `${trip.progress || 0}%` }}
                />
             </div>
             <p className="text-xs text-warm-500 mt-2">{trip.phase}</p>
          </div>
          
          <div className="flex items-center">
            <MemberAvatars members={trip.members} size="sm" className="-space-x-2" />
          </div>
        </div>
      </div>
    </Card>
  );
}
