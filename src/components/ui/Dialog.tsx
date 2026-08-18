import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'motion/react';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  theme?: 'light' | 'dark';
}

export function Dialog({ open, onClose, title, theme = 'light', children, className, ...props }: DialogProps) {
  const isDark = theme === 'dark';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className={cn(
              "absolute inset-0 backdrop-blur-md",
              isDark ? "bg-black/70" : "bg-warm-900/40"
            )}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full max-w-lg rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto border',
              isDark
                ? 'bg-warm-900 border-white/10 text-white'
                : 'bg-white border-warm-200 text-warm-900',
              className
            )}
            {...props}
          >
            <div className="flex flex-col h-full">
              <div className={cn(
                "flex items-center justify-between p-6 sticky top-0 z-10",
                isDark
                  ? 'bg-warm-900/90 backdrop-blur-md border-b border-white/5'
                  : 'bg-white/90 backdrop-blur-md border-b border-warm-200',
                !title && 'border-b-0'
              )}>
                {title ? (
                  <h2 className={cn(
                    "text-xl font-bold tracking-tight",
                    isDark ? "text-white" : "text-warm-900"
                  )}>{title}</h2>
                ) : (
                  <div />
                )}
                <button
                  onClick={onClose}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-colors focus:outline-none",
                    isDark
                      ? "text-white/40 hover:text-white hover:bg-white/10"
                      : "text-warm-500 hover:text-warm-700 hover:bg-warm-100"
                  )}
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
              <div className="p-6 pt-2">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
