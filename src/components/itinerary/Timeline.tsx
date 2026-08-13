import React from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'motion/react';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ children, className }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn("relative pl-[4.5rem]", className)}>
      {/* Vertical line */}
      <div className="absolute left-[5.25rem] top-4 bottom-4 w-px bg-warm-200" />
      
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {childrenArray.map((child, index) => {
            let isHighlighted = false;
            if (React.isValidElement(child) && (child as React.ReactElement<any>).props.item?.isMustDo) {
              isHighlighted = true;
            }

            const key = React.isValidElement(child) && child.key ? child.key : index;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                key={key}
                className="relative z-10"
              >
                {/* Dot */}
                <div 
                  className={cn(
                    "absolute -left-3.5 top-6 w-2.5 h-2.5 rounded-full border-2 bg-white",
                    isHighlighted ? "border-accent-400 bg-accent-400" : "border-warm-300"
                  )}
                />
                {child}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
