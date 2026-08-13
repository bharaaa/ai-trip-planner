import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '../ui/Badge';
import { MemberAvatars } from './MemberAvatars';
import type { Member } from './MemberAvatars';

export interface TripHeaderProps {
  tripName: string;
  members: Member[];
  phase: string;
  onSettingsClick?: () => void;
  className?: string;
}

export function TripHeader({ tripName, members, phase, className }: TripHeaderProps) {
  return (
    <div className={cn('px-6 py-4 flex items-center justify-between', className)}>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-warm-900">{tripName}</h1>
        <Badge variant="accent" className="hidden sm:inline-flex">{phase}</Badge>
      </div>
      
      <div className="flex items-center gap-4">
        <MemberAvatars members={members} size="sm" />
      </div>
    </div>
  );
}
