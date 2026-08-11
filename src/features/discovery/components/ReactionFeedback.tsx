import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import type { NegativeReason } from '@/types';


interface ReactionFeedbackProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reasons: NegativeReason[]) => void;
}

const REASONS: { id: NegativeReason; label: string }[] = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'too_crowded', label: 'Too crowded' },
  { id: 'too_much_travel', label: 'Too much travel' },
  { id: 'not_interested', label: 'Not interested' },
  { id: 'doesnt_fit_group', label: "Doesn't fit our group" },
  { id: 'other', label: 'Other' },
];

export const ReactionFeedback: React.FC<ReactionFeedbackProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<Set<NegativeReason>>(new Set());
  const [otherText, setOtherText] = useState('');

  if (!open) return null;

  const handleToggle = (id: NegativeReason) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Array.from(selected));
    setSelected(new Set());
    setOtherText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-warm-200 flex justify-between items-center">
          <h3 className="font-semibold text-warm-900">Why wasn't this a good fit?</h3>
          <button 
            onClick={onClose}
            className="text-warm-500 hover:bg-warm-100 p-2 rounded-full transition-colors flex items-center justify-center text-xl leading-none w-8 h-8"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-warm-600 mb-4">
            Help us refine future suggestions by letting us know what didn't work for you.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {REASONS.map((reason) => (
              <button
                key={reason.id}
                type="button"
                onClick={() => handleToggle(reason.id)}
                className={cn(
                  "p-3 text-sm text-left rounded-xl border transition-colors duration-200",
                  selected.has(reason.id)
                    ? "border-accent-400 bg-accent-50 text-accent-900"
                    : "border-warm-200 hover:border-warm-300 text-warm-700 bg-white"
                )}
              >
                {reason.label}
              </button>
            ))}
          </div>

          {selected.has('other') && (
            <div className="mb-6 animate-fade-in">
              <label htmlFor="other_reason" className="sr-only">Other reason</label>
              <textarea
                id="other_reason"
                className="w-full p-3 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                placeholder="Tell us more..."
                rows={3}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-warm-600 hover:bg-warm-50 rounded-lg transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={selected.size === 0}
              className="px-6 py-2 bg-warm-900 hover:bg-warm-800 disabled:bg-warm-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
