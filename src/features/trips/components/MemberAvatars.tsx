import React from 'react';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';

export interface Member {
  name: string;
  avatarUrl?: string;
}

export interface MemberAvatarsProps {
  members: Member[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MemberAvatars({ members, max = 4, size = 'sm', className }: MemberAvatarsProps) {
  return (
    <AvatarGroup max={max} size={size} className={className}>
      {members.map((member, i) => (
        <Avatar key={i} name={member.name} src={member.avatarUrl} size={size} />
      ))}
    </AvatarGroup>
  );
}
