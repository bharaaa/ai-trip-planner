import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';
import { AnimatePresence, motion } from 'motion/react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { ArrowLeft, CalendarRange, Calendar, Shuffle } from 'lucide-react';
import { differenceInDays, format, addMonths } from 'date-fns';
import type { Trip } from '@/types';
import type { DateRange } from 'react-day-picker';

interface EditTripDateModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  onUpdate: (data: { flexibleDates: boolean, startDate?: Date, endDate?: Date, dateMonth?: string, duration?: number }) => Promise<void>;
}

const next12Months = Array.from({ length: 12 }).map((_, i) => {
  const d = addMonths(new Date(), i);
  return {
    label: format(d, 'MMMM yyyy'),
    value: format(d, 'MMMM yyyy')
  };
});

export const EditTripDateModal: React.FC<EditTripDateModalProps> = ({
  open,
  onClose,
  trip,
  onUpdate
}) => {
  const [dateFlexibility, setDateFlexibility] = useState<'exact' | 'month' | 'flexible'>('exact');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [dateMonth, setDateMonth] = useState<string>('');
  const [duration, setDuration] = useState<number>(7);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (!trip.flexibleDates && trip.startDate && trip.endDate) {
        setDateFlexibility('exact');
        setDateRange({ from: new Date(trip.startDate), to: new Date(trip.endDate) });
      } else if (trip.flexibleDates && trip.dateMonth) {
        setDateFlexibility('month');
        setDateMonth(trip.dateMonth);
        setDuration(trip.duration || 7);
      } else {
        setDateFlexibility('flexible');
        setDuration(trip.duration || 7);
      }
    }
  }, [open, trip]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalDuration = duration;
      if (dateFlexibility === 'exact' && dateRange?.from && dateRange?.to) {
        finalDuration = differenceInDays(dateRange.to, dateRange.from) + 1;
      }

      await onUpdate({
        flexibleDates: dateFlexibility !== 'exact',
        startDate: dateFlexibility === 'exact' && dateRange?.from ? dateRange.from : undefined,
        endDate: dateFlexibility === 'exact' && dateRange?.to ? dateRange.to : undefined,
        dateMonth: dateFlexibility === 'month' ? dateMonth : undefined,
        duration: finalDuration
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    if (dateFlexibility === 'exact') return !!(dateRange?.from && dateRange?.to);
    if (dateFlexibility === 'month') return !!dateMonth && duration > 0;
    return duration > 0;
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[480px] bg-warm-950 border-l border-white/5 flex flex-col shadow-2xl"
          >
            {/* Panel Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-white/30 tracking-widest uppercase">Timing</span>
              </div>

              <h2 className="text-4xl font-black tracking-tighter text-white mb-2">
                Travel Dates.
              </h2>
              <p className="text-white/40 text-sm font-medium mb-8">
                Update when you want to go.
              </p>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-10">
              
              {/* Type Selectors */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'exact' as const, label: 'Exact Dates', icon: CalendarRange },
                  { type: 'month' as const, label: 'Sometime In...', icon: Calendar },
                  { type: 'flexible' as const, label: 'Flexible', icon: Shuffle }
                ].map(opt => {
                  const Icon = opt.icon;
                  const isActive = dateFlexibility === opt.type;
                  return (
                    <button 
                      key={opt.type}
                      onClick={() => setDateFlexibility(opt.type)}
                      className={cn(
                        "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                        isActive 
                          ? "border-accent-400 bg-accent-500/10 shadow-[0_0_15px_rgba(14,165,233,0.15)] text-accent-400" 
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", isActive ? "text-accent-400" : "text-white/40")} />
                      <span className={cn("font-bold text-xs tracking-wide", isActive ? "text-white" : "text-white/60")}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Inputs based on type */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={dateFlexibility}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {dateFlexibility === 'exact' && (
                    <div className="w-full flex flex-col items-center">
                      <DateRangePicker 
                        selected={dateRange}
                        onSelect={setDateRange}
                        theme="dark"
                        className="mx-auto border-white/10 bg-white/5"
                      />
                      {dateRange?.from && dateRange?.to && (
                        <p className="text-center text-sm font-bold text-accent-400 mt-6 bg-accent-500/10 px-4 py-2 rounded-full">
                          {differenceInDays(dateRange.to, dateRange.from) + 1} days trip
                        </p>
                      )}
                    </div>
                  )}
                  
                  {dateFlexibility === 'month' && (
                    <div className="space-y-8">
                      <div className="relative">
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Which month?</label>
                        <select
                          value={dateMonth}
                          onChange={(e) => setDateMonth(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:ring-0 focus:border-accent-400 transition-colors appearance-none"
                        >
                          <option value="" disabled className="bg-warm-950 text-white/50">Select a month</option>
                          {next12Months.map(m => (
                            <option key={m.value} value={m.value} className="bg-warm-950 text-white">{m.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">How many days?</label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:ring-0 focus:border-accent-400 transition-colors appearance-none"
                        />
                      </div>
                    </div>
                  )}

                  {dateFlexibility === 'flexible' && (
                    <div className="relative">
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">How many days?</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                        min={1}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:ring-0 focus:border-accent-400 transition-colors appearance-none"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-white/5 bg-warm-950/80 backdrop-blur-md">
              <button
                onClick={handleSave}
                disabled={!isFormValid() || isSaving}
                className={cn(
                  "w-full font-bold text-lg px-5 py-4 rounded-full transition-all flex items-center justify-center gap-2",
                  (!isFormValid() || isSaving)
                    ? "bg-white/10 text-white/30 cursor-not-allowed"
                    : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                )}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Dates'
                )}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
