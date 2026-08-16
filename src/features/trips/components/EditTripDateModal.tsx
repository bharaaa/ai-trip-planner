import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { CalendarRange, Calendar, Shuffle } from 'lucide-react';
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

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl w-full">
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-warm-900 tracking-tight">Edit Travel Dates</h2>
          <p className="text-warm-600">Update when you want to go.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { type: 'exact' as const, label: 'Locked In', icon: <CalendarRange className="w-6 h-6 text-warm-600 mb-1" /> },
            { type: 'month' as const, label: 'Sometime in...', icon: <Calendar className="w-6 h-6 text-warm-600 mb-1" /> },
            { type: 'flexible' as const, label: 'Sometime in the future', icon: <Shuffle className="w-6 h-6 text-warm-600 mb-1" /> }
          ].map(opt => (
            <Card 
              key={opt.type}
              className={cn(
                "p-4 cursor-pointer hover:border-accent-400 transition-colors flex flex-col items-center gap-2",
                dateFlexibility === opt.type ? "border-accent-400 bg-accent-50/50" : "border-warm-200"
              )}
              onClick={() => setDateFlexibility(opt.type)}
            >
              {opt.icon}
              <span className="font-medium text-sm text-center text-warm-900">{opt.label}</span>
            </Card>
          ))}
        </div>

        <div className="space-y-4 pt-4 flex flex-col items-center min-h-[320px]">
          {dateFlexibility === 'exact' && (
            <div className="w-full">
              <DateRangePicker 
                selected={dateRange}
                onSelect={setDateRange}
                className="mx-auto"
              />
              {dateRange?.from && dateRange?.to && (
                <p className="text-center text-sm font-medium text-warm-600 mt-4">
                  {differenceInDays(dateRange.to, dateRange.from) + 1} days trip
                </p>
              )}
            </div>
          )}
          
          {dateFlexibility === 'month' && (
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-warm-900">Which month?</label>
                <Select
                  value={dateMonth}
                  onChange={setDateMonth}
                  options={next12Months}
                  placeholder="Select a month"
                />
              </div>
              <Input
                type="number"
                label="How many days?"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
          )}

          {dateFlexibility === 'flexible' && (
            <div className="w-full max-w-sm">
              <Input
                type="number"
                label="How many days?"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-warm-200">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isFormValid()} isLoading={isSaving}>Save Dates</Button>
        </div>
      </div>
    </Dialog>
  );
};
