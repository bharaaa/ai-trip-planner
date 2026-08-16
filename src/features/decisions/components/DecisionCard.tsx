import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
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
  const isDecided = decision.status === 'decided';
  
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
        <Badge variant={isDecided ? 'success' : decision.status === 'voting' ? 'warning' : 'default'} className={cn(
          isDecided && "bg-success-100 text-success-700",
          decision.status === 'voting' && "bg-warning-100 text-warning-700",
          decision.status === 'open' && "bg-warm-100 text-warm-700"
        )}>
          {isDecided ? 'Decided' : decision.status === 'voting' ? 'Voting' : 'Open'}
        </Badge>
      </div>
      
      <div className="pb-4 px-6">
        {isDecided ? (
          <div className="bg-success-50 rounded-xl p-3 flex items-center gap-2">
             <span className="text-success-600 font-medium text-sm">✓ Selected:</span>
             <span className="text-warm-800 font-medium text-sm">{decision.options.find(o => o.id === decision.decidedOption)?.title || 'Unknown'}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {decision.options.map(option => (
              <div 
                key={option.id} 
                className="flex items-center justify-between p-3 rounded-xl border border-warm-200/40 bg-warm-50 hover:bg-warm-100 transition-colors cursor-pointer"
                onClick={() => onVote?.(option.id)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-warm-800">{option.title}</span>
                  {option.description && <span className="text-xs text-warm-500 mt-0.5">{option.description}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {option.votes?.map((vote, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-warm-200 text-[10px] flex items-center justify-center border-2 border-white">{vote.userId.charAt(0)}</div>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-warm-400 w-4 text-right">
                    {option.votes?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
