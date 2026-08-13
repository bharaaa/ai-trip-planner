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
    <Card className={cn("border-l-4 border-l-accent-400 bg-white shadow-sm p-5 md:p-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-accent-600 uppercase">Next Decision</span>
            {type && <div className="text-xs font-medium text-warm-500 bg-warm-100 px-2 py-0.5 rounded-full capitalize">{type}</div>}
          </div>
          
          <h2 className="text-xl font-semibold text-warm-900 leading-tight">
            {title}
          </h2>
          
          <p className="text-sm text-warm-600 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="shrink-0">
          <Button onClick={onAction} className="w-full md:w-auto">
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
