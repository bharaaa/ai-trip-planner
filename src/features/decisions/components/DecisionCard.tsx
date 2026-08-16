import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useTripStore } from '@/stores/tripStore';
import { useAuthStore } from '@/stores/authStore';
import type { Decision } from '@/types';

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
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      isDecided ? "bg-warm-50 border-warm-200" : "bg-white border-warm-200 hover:border-warm-300 shadow-sm hover:shadow"
    )}>
      <div className="pb-3 flex flex-row items-start justify-between space-y-0 p-6">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center text-xl shadow-sm">
            {getIconForType(decision.type)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-warm-900 leading-tight mb-1">
              {decision.title}
            </h3>
            <p className="text-xs text-warm-500 font-medium">{decision.description || 'Make a choice'}</p>
          </div>
        </div>
        <div className="shrink-0">
          <Badge variant={isDecided ? 'success' : decision.status === 'voting' ? 'warning' : 'default'} className={cn(
            isDecided && "bg-success-100 text-success-700",
            isClosed && "bg-warm-100 text-warm-600",
            decision.status === 'voting' && "bg-warning-100 text-warning-700",
            decision.status === 'open' && "bg-warm-100 text-warm-700"
          )}>
            {isDecided ? 'Decided' : isClosed ? 'Closed' : decision.status === 'voting' ? 'Voting' : 'Open'}
          </Badge>
        </div>
      </div>
      
      <div className="pb-4 px-6">
        {isDecided ? (
          <div className="bg-success-50 rounded-xl p-4 flex items-center gap-3 border border-success-100">
             <div className="w-8 h-8 rounded-full bg-success-200 text-success-700 flex items-center justify-center font-bold">
               ✓
             </div>
             <div>
               <span className="block text-success-600 font-medium text-xs uppercase tracking-wider mb-0.5">Selected</span>
               <span className="block text-success-900 font-semibold text-sm">{decision.options.find(o => o.id === decision.decidedOption)?.title || 'Unknown'}</span>
             </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {decision.options.map(option => {
              // Assume if there's any vote, we highlight it playfully (you could check currentUser.id if available)
              const hasVotes = option.votes && option.votes.length > 0;
              return (
                <div 
                  key={option.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer group",
                    hasVotes ? "border-accent-200 bg-accent-50/50 hover:bg-accent-50" : "border-warm-200/60 bg-white hover:border-accent-300 hover:shadow-xs"
                  )}
                  onClick={() => onVote?.(option.id)}
                >
                  <div className="flex flex-col pr-4">
                    <span className={cn("text-sm font-semibold", hasVotes ? "text-accent-900" : "text-warm-800")}>{option.title}</span>
                    {option.description && <span className={cn("text-xs mt-0.5", hasVotes ? "text-accent-600" : "text-warm-500")}>{option.description}</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex -space-x-1.5">
                      {option.votes?.map((vote, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-accent-200 text-accent-800 text-[10px] font-bold flex items-center justify-center border-2 border-white z-10" title={activeTrip?.members.find(m => m.userId === vote.userId)?.name || 'Unknown'}>
                          {getUserInitial(vote.userId)}
                        </div>
                      ))}
                    </div>
                    <span className={cn("text-xs font-semibold w-4 text-right", hasVotes ? "text-accent-600" : "text-warm-400 group-hover:text-accent-400")}>
                      {option.votes?.length || 0}
                    </span>
                    {isAdmin && !isDecided && !isClosed && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDecisionStatus(activeTrip!.id, decision.id, 'decided', option.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-[10px] uppercase font-bold text-success-700 bg-success-100 hover:bg-success-200 px-2 py-1 rounded"
                      >
                        Winner
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isAdmin && !isDecided && !isClosed && (
          <div className="mt-4 pt-4 border-t border-warm-100/60 flex justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); updateDecisionStatus(activeTrip!.id, decision.id, 'deferred'); }}
              className="text-xs font-semibold text-warm-500 hover:text-warm-800 transition-colors"
            >
              Close Poll without deciding
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
