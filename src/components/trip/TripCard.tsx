import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { MemberAvatars } from './MemberAvatars';

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
      className={className}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-warm-900 mb-1">{trip.name}</h3>
          <p className="text-warm-500 text-sm">{trip.selectedDestination?.name || 'Deciding destination...'}</p>
        </div>
        <Badge variant={statusColors[trip.status] || 'default'} className="capitalize">
          {trip.status}
        </Badge>
      </div>

      <div className="mb-6">
        <Progress 
          value={trip.progress || 0} 
          label={trip.phase} 
          showValue 
          size="sm" 
        />
      </div>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-warm-100">
        <MemberAvatars members={trip.members} size="sm" />
        <span className="text-xs text-warm-500">
          {trip.memberCount} traveler{trip.memberCount !== 1 ? 's' : ''}
        </span>
      </div>
    </Card>
  );
}
