import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { Search, UserPlus, X, Check, ArrowLeft } from 'lucide-react';
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
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      setTimeout(() => inputRef.current?.focus(), 400);
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
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

  // Count already-invited members
  const pendingInvites = existingMembers.filter(m => m.status === 'invited');

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[440px] bg-warm-950 border-l border-white/5 flex flex-col shadow-2xl"
          >
            {/* Panel Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-white/30 tracking-widest uppercase">Invite</span>
              </div>

              <h2 className="text-4xl font-black tracking-tighter text-white mb-2">
                Add your crew.
              </h2>
              <p className="text-white/40 text-sm font-medium mb-8">
                Find friends and bring them into the trip.
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-transparent border-none border-b border-white/10 pl-8 pr-4 py-3 text-lg font-medium text-white placeholder-white/20 focus:outline-none focus:ring-0 caret-accent-400"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10" />
                {searchQuery.length > 0 && (
                  <motion.div 
                    className="absolute bottom-0 left-0 h-[1px] bg-accent-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-20">
                    <div className="flex gap-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-accent-400 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </motion.div>
                ) : searchQuery.trim().length >= 2 && searchResults.length > 0 ? (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                    {searchResults.map((user, i) => {
                      const isInvited = existingMembers.some(m => m.userId === user.id && m.status === 'invited') || justInvited.has(user.id);
                      
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-4 p-4 -mx-2 rounded-2xl hover:bg-white/5 transition-colors group"
                        >
                          <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0 transition-all",
                            isInvited
                              ? "bg-accent-500/20 text-accent-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                              : "bg-white/10 text-white/80 group-hover:bg-white/15"
                          )}>
                            {user.name.charAt(0)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-base truncate">{user.name}</p>
                            <p className="text-sm text-white/30 truncate">{user.email}</p>
                          </div>
                          
                          {isInvited ? (
                            <button
                              onClick={() => handleCancel(user)}
                              className="shrink-0 text-xs font-bold text-accent-400 bg-accent-500/10 px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-error-500/10 hover:text-error-400 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Invited
                            </button>
                          ) : (
                            <button
                              onClick={() => handleInvite(user)}
                              className="shrink-0 bg-white text-black font-bold text-sm px-5 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                              Invite
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
                    <p className="text-white/30 text-sm font-medium">No one found for "{searchQuery}"</p>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <UserPlus className="w-8 h-8 text-white/15" />
                    </div>
                    <p className="text-white/20 text-sm font-medium">Start typing to find friends</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom: Pending Invites Summary */}
            {pendingInvites.length > 0 && (
              <div className="p-6 border-t border-white/5">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Pending</p>
                <div className="flex flex-wrap gap-2">
                  {pendingInvites.map(m => (
                    <div key={m.userId} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full pl-1.5 pr-3 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-white/60">{m.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
