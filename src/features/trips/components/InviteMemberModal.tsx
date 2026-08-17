import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import type { User, TripMember } from '@/types';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  existingMembers: TripMember[];
}

export function InviteMemberModal({ open, onClose, tripId, existingMembers }: InviteMemberModalProps) {
  const { searchUsers, inviteMember } = useTripStore();
  const { user: currentUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    if (searchRef.current) clearTimeout(searchRef.current);
    
    searchRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchUsers(searchQuery);
      
      // Filter out users already in the trip with 'joined' status
      const filtered = results.filter(u => 
        !existingMembers.some(member => member.userId === u.id && member.status === 'joined')
      );
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
    
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [searchQuery, existingMembers, searchUsers]);

  const handleInvite = (user: User) => {
    const newMember: TripMember = {
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: 'member',
      status: 'invited',
      joinedAt: new Date(),
      preferencesSubmitted: false
    };
    inviteMember(tripId, newMember);
  };

  const handleCancel = (user: User) => {
    useTripStore.getState().cancelInvitation(tripId, user.id, user.name);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Invite to Trip" className="max-w-md w-full">
      <div className="p-6">
        <p className="text-warm-500 mb-4 text-sm">
          Search for friends by name or email to invite them to this trip.
        </p>
        
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email..."
            className="w-full"
            autoFocus
          />
          
          <div className="mt-4 min-h-[200px] max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <p className="text-sm text-warm-500 p-4 text-center">Searching...</p>
            ) : searchQuery.trim().length >= 2 ? (
              searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(user => {
                    const isInvited = existingMembers.some(m => m.userId === user.id && m.status === 'invited');
                    
                    return (
                    <div
                      key={user.id}
                      className="w-full flex items-center justify-between p-3 border border-warm-200 rounded-lg bg-warm-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center font-medium text-warm-700 text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-warm-900 text-sm">{user.name}</p>
                          <p className="text-xs text-warm-500">{user.email}</p>
                        </div>
                      </div>
                      {isInvited ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-warm-500 px-2 py-1 bg-warm-200 rounded-md">Invited</span>
                          <Button size="sm" variant="secondary" onClick={() => handleCancel(user)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleInvite(user)}>
                          Invite
                        </Button>
                      )}
                    </div>
                  )})}
                </div>
              ) : (
                <p className="text-sm text-warm-500 p-4 text-center">No users found.</p>
              )
            ) : null}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
