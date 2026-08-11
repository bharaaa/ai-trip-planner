import React from 'react';
import { cn } from '@/lib/utils/cn';
// Use emoji instead of lucide-react

interface ConflictItem {
  memberName: string;
  preference: string;
}

interface ConflictResolutionProps {
  conflicts: ConflictItem[];
  onFindCompromise: () => void;
  className?: string;
}

export const ConflictResolution: React.FC<ConflictResolutionProps> = ({
  conflicts,
  onFindCompromise,
  className,
}) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className={cn("bg-amber-50 border border-amber-200 rounded-2xl p-6", className)}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-full mt-1 shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Your group has different preferences
          </h3>
          <p className="text-sm text-amber-700 mb-4 leading-relaxed">
            It looks like there are some differing priorities within the group. 
            Here's what everyone is leaning towards:
          </p>
          
          <ul className="space-y-2 mb-6">
            {conflicts.map((conflict, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-amber-800">
                <span className="font-medium bg-amber-100 px-2 py-0.5 rounded text-amber-900">
                  {conflict.memberName}
                </span>
                <span>prefers</span>
                <span className="font-semibold">{conflict.preference}</span>
              </li>
            ))}
          </ul>
          
          <button
            onClick={onFindCompromise}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Find a compromise
          </button>
        </div>
      </div>
    </div>
  );
};
