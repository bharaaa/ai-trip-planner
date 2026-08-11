import React from 'react';
import { cn } from '@/lib/utils/cn';

interface TimelineProps {
  children: React.ReactNode;
}

export const Timeline: React.FC<TimelineProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="relative pl-[4.5rem]">
      {/* Vertical line */}
      <div className="absolute left-[5.25rem] top-4 bottom-4 w-px bg-warm-200" />
      
      <div className="flex flex-col gap-4">
        {childrenArray.map((child, index) => {
          let isHighlighted = false;
          if (React.isValidElement(child) && (child as React.ReactElement<any>).props.item?.isMustDo) {
            isHighlighted = true;
          }

          return (
            <div key={index} className="relative z-10">
              {/* Dot */}
              <div 
                className={cn(
                  "absolute -left-3.5 top-6 w-2.5 h-2.5 rounded-full border-2 bg-white",
                  isHighlighted ? "border-accent-400 bg-accent-400" : "border-warm-300"
                )}
              />
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};
