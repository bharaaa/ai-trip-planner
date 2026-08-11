import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

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
    } else if (!open && dialog.open) {
      dialog.close();
    }
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
      className={cn(
        'bg-white rounded-2xl shadow-xl max-w-lg w-full p-0 backdrop:bg-warm-900/40 backdrop:backdrop-blur-sm',
        'open:animate-in open:zoom-in-95 open:fade-in-0 duration-200',
        className
      )}
      {...props}
    >
      <div className="p-6">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-warm-900">{title}</h2>
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
        )}
        {children}
      </div>
    </dialog>
  );
}
