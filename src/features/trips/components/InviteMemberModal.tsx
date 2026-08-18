import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { Search, UserPlus, X, Check } from 'lucide-react';
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
  const [justInvited, setJustInvited] = useState<Set<string>>(new Set());
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
      setJustInvited(new Set());
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
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
    setJustInvited(prev => new Set(prev).add(user.id));
  };

  const handleCancel = (user: User) => {
    useTripStore.getState().cancelInvitation(tripId, user.id, user.name);
    setJustInvited(prev => {
      const next = new Set(prev);
      next.delete(user.id);
      return next;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Invite Friends" theme="dark" className="max-w-md w-full">
      <div className="space-y-6">
        <p className="text-white/50 text-sm font-medium">
          Find your crew and bring them along.
        </p>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-base font-medium placeholder-white/30 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          />
        </div>
        
        {/* Results */}
        <div className="min-h-[200px] max-h-[320px] overflow-y-auto -mx-2 px-2">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-12">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </motion.div>
            ) : searchQuery.trim().length >= 2 ? (
              searchResults.length > 0 ? (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  {searchResults.map((user, i) => {
                    const isInvited = existingMembers.some(m => m.userId === user.id && m.status === 'invited') || justInvited.has(user.id);
                    
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors",
                          isInvited
                            ? "bg-accent-500/20 text-accent-400"
                            : "bg-white/10 text-white group-hover:bg-white/15"
                        )}>
                          {user.name.charAt(0)}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                          <p className="text-xs text-white/40 truncate">{user.email}</p>
                        </div>
                        
                        {/* Action */}
                        {isInvited ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-accent-400 bg-accent-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                              <Check className="w-3 h-3" />
                              Sent
                            </span>
                            <button
                              onClick={() => handleCancel(user)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-error-500 hover:bg-error-500/10 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInvite(user)}
                            className="shrink-0 flex items-center gap-2 bg-white text-warm-950 font-bold text-sm px-4 py-2 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all"
                          >
                            <UserPlus className="w-4 h-4" />
                            Invite
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm font-medium">No users found</p>
                  <p className="text-white/20 text-xs mt-1">Try a different name or email</p>
                </motion.div>
              )
            ) : (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/30 text-sm font-medium">Type at least 2 characters to search</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Dialog>
  );
}
