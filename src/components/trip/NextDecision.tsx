import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils/cn';

export interface NextDecisionProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  type?: React.ReactNode;
  className?: string;
}

export function NextDecision({ title, description, actionLabel, onAction, type, className }: NextDecisionProps) {
  return (
    <Card className={cn(className)} variant="highlighted">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold tracking-wider text-accent-600 uppercase">Next</span>
          {type && <div className="text-accent-500">{type}</div>}
        </div>
        
        <h2 className="text-2xl font-semibold text-warm-900 mb-2 leading-tight">
          {title}
        </h2>
        
        <p className="text-warm-600 mb-8 leading-relaxed">
          {description}
        </p>
        
        <div className="mt-auto pt-4">
          <Button onClick={onAction} className="w-full sm:w-auto" size="lg">
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
