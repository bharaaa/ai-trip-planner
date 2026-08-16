import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'motion/react';

export interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export function Dialog({ open, onClose, title, children, className, ...props }: DialogProps) {
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

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className={cn(
        'bg-white rounded-2xl shadow-xl max-w-lg w-[calc(100%-2rem)] sm:w-full p-0 m-auto backdrop:bg-warm-900/40 backdrop:backdrop-blur-sm max-h-[85vh] overflow-y-auto',
        className
      )}
      {...props}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="flex flex-col h-full"
          >
            <div className={cn("flex items-center justify-between p-5 sticky top-0 bg-white z-10", title && "border-b border-warm-200")}>
              {title ? (
                <h2 className="text-lg font-semibold text-warm-900">{title}</h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-warm-500 hover:text-warm-700 rounded-full hover:bg-warm-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-5 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
