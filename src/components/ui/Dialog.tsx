import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'motion/react';

export interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  theme?: 'light' | 'dark';
}

export function Dialog({ open, onClose, title, theme = 'light', children, className, ...props }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const isDark = theme === 'dark';

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className={cn(
        'rounded-3xl shadow-2xl max-w-lg w-[calc(100%-2rem)] sm:w-full p-0 m-auto max-h-[85vh] overflow-y-auto border',
        isDark
          ? 'bg-warm-900 border-white/10 backdrop:bg-black/70 backdrop:backdrop-blur-md text-white'
          : 'bg-white border-warm-200 backdrop:bg-warm-900/40 backdrop:backdrop-blur-sm text-warm-900',
        className
      )}
      {...props}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full"
          >
            <div className={cn(
              "flex items-center justify-between p-6 sticky top-0 z-10",
              isDark
                ? 'bg-warm-900 border-b border-white/5'
                : 'bg-white border-b border-warm-200',
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
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
