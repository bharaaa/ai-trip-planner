import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import type { Decision } from '@/types';
import { Check, X, Hand } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
  onVote?: (optionId: string) => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'destination': return '🌍';
    case 'dates': return '📅';
    case 'accommodation': return '🏨';
    case 'transport': return '🚗';
    case 'activity': return '🏖';
    default: return '📝';
  }
};

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onVote }) => {
  const { activeTrip, updateDecisionStatus } = useTripStore();
  const { user } = useAuthStore();
  const isAdmin = activeTrip?.members.find(m => m.userId === user?.id)?.role === 'admin';
  const isDecided = decision.status === 'decided';
  const isClosed = decision.status === 'deferred';

  const getUserInitial = (userId: string) => {
    const member = activeTrip?.members.find(m => m.userId === userId);
    return member?.name ? member.name.charAt(0).toUpperCase() : userId.charAt(0).toUpperCase();
  };
  
  const getUserAvatar = (userId: string) => {
    const member = activeTrip?.members.find(m => m.userId === userId);
    return member?.avatarUrl;
  };

  const totalVotes = decision.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
  const maxPossibleVotes = activeTrip?.members.length || 1;

  const handleClosePoll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeTrip || decision.options.length === 0) return;

    let winningOption = decision.options[0];
    let maxVotes = winningOption.votes?.length || 0;
    
    for (let i = 1; i < decision.options.length; i++) {
      const option = decision.options[i];
      const votesCount = option.votes?.length || 0;
      if (votesCount > maxVotes) {
        winningOption = option;
        maxVotes = votesCount;
      }
    }

    updateDecisionStatus(activeTrip.id, decision.id, 'decided', winningOption.id);
  };
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-[2rem] p-6 md:p-8 transition-all duration-500",
      isDecided ? "bg-white/10" : "bg-white/5 shadow-sm border border-white/10"
    )}>
      {isDecided && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-success-500/20 rounded-bl-full -z-10 opacity-50" />
      )}
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div className="flex gap-4 items-start">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0",
            isDecided ? "bg-success-500/20 text-success-400" : "bg-white/10"
          )}>
            {getIconForType(decision.type)}
          </div>
          <div>
            <h3 className={cn("text-xl font-bold tracking-tight mb-1", isDecided ? "text-warm-300" : "text-white")}>
              {decision.title}
            </h3>
            <p className="text-sm text-warm-400 font-medium">{decision.description || 'The group needs your vote'}</p>
          </div>
        </div>
        <div className="shrink-0 self-start">
          <Badge variant={isDecided ? 'success' : decision.status === 'voting' ? 'warning' : 'default'} className={cn(
            "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs",
            isDecided && "bg-success-500 text-white border-none",
            isClosed && "bg-white/20 text-warm-300 border-none",
            decision.status === 'voting' && "bg-energy-500 text-white border-none",
            decision.status === 'open' && "bg-accent-500 text-white border-none"
          )}>
            {isDecided ? 'Decided' : isClosed ? 'Closed' : decision.status === 'voting' ? 'Voting' : 'Open'}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        {isDecided ? (
          <AnimatePresence>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-success-500/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-success-500/20 shadow-sm"
            >
               <div className="w-12 h-12 rounded-full bg-success-500 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                 <Check strokeWidth={3} />
               </div>
               <span className="block text-success-400 font-bold text-xs uppercase tracking-widest mb-1">We're going with</span>
               <span className="block text-success-100 font-bold text-2xl tracking-tight">
                 {decision.options.find(o => o.id === decision.decidedOption)?.title || 'Unknown'}
               </span>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="space-y-3">
            {decision.options.map((option, index) => {
              const voteCount = option.votes?.length || 0;
              const hasVotes = voteCount > 0;
              const isLeading = hasVotes && voteCount === Math.max(...decision.options.map(o => o.votes?.length || 0));
              // Calculate fill percentage relative to total members, minimum 5% so it's visible, max 100%
              const fillPercentage = hasVotes ? Math.max(10, (voteCount / maxPossibleVotes) * 100) : 0;
              const userVotedForThis = option.votes?.some(v => v.userId === user?.id);

              return (
                <div 
                  key={option.id} 
                  className="relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer group bg-white/5 border border-white/10 hover:border-white/20"
                  onClick={() => onVote?.(option.id)}
                >
                  {/* The Horizontal Bar Graph Background */}
                  <motion.div 
                    className={cn(
                      "absolute top-0 left-0 h-full opacity-20 transition-all duration-500",
                      isLeading ? "bg-accent-500" : "bg-warm-400"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${fillPercentage}%` }}
                    transition={{ type: "spring", bounce: 0.2, duration: 1 }}
                  />

                  {/* Highlight border if user voted */}
                  {userVotedForThis && (
                    <div className="absolute inset-0 border-2 border-accent-500 rounded-2xl pointer-events-none" />
                  )}

                  <div className="relative z-10 p-4 flex items-center justify-between min-h-[4.5rem]">
                    <div className="flex flex-col pr-4">
                      <span className={cn("text-base font-bold tracking-tight", userVotedForThis ? "text-accent-300" : "text-white")}>
                        {option.title}
                      </span>
                      {option.description && (
                        <span className={cn("text-sm mt-0.5", userVotedForThis ? "text-accent-300 font-medium" : "text-warm-400")}>
                          {option.description}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex -space-x-2 mr-2">
                        {option.votes?.map((vote, i) => (
                          <div 
                            key={i} 
                            className="w-8 h-8 rounded-full bg-warm-900 text-white text-xs font-bold flex items-center justify-center border-[2px] border-warm-800 shadow-sm z-10 overflow-hidden" 
                            title={activeTrip?.members.find(m => m.userId === vote.userId)?.name || 'Unknown'}
                          >
                            {getUserAvatar(vote.userId) ? (
                              <img src={getUserAvatar(vote.userId)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              getUserInitial(vote.userId)
                            )}
                          </div>
                        ))}
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                        userVotedForThis ? "bg-accent-500 text-white shadow-md" : "bg-white/10 text-warm-300 group-hover:bg-white/20"
                      )}>
                        {userVotedForThis ? <Hand size={14} className="fill-current" /> : voteCount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isAdmin && !isDecided && !isClosed && (
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); updateDecisionStatus(activeTrip!.id, decision.id, 'deferred'); }}
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-warm-300 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel Poll
            </button>
            <button 
              onClick={handleClosePoll}
              disabled={totalVotes === 0}
              title={totalVotes === 0 ? "Cannot select a winner with zero votes" : ""}
              className="text-sm font-bold px-6 py-2.5 rounded-xl bg-white text-warm-950 hover:bg-warm-100 disabled:bg-white/10 disabled:text-warm-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Check size={16} /> Finalize Decision
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
