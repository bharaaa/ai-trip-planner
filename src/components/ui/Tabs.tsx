import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange, className, ...props }: TabsProps) {
  return (
    <div className={cn('flex gap-1 bg-warm-100 rounded-xl p-1', className)} role="tablist" {...props}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
              isActive
                ? 'bg-white shadow-sm text-warm-900 font-medium'
                : 'text-warm-500 hover:text-warm-700 hover:bg-warm-200/50'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
