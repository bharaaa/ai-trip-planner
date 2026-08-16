import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils/cn';

interface DateRangePickerProps {
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ selected, onSelect, className }: DateRangePickerProps) {
  const [holidays, setHolidays] = useState<Date[]>([]);

  useEffect(() => {
    // Fetch holidays for the current year and next year for Indonesia
    const fetchHolidays = async () => {
      try {
        const currentYear = new Date().getFullYear();
        
        // Fetch current and next year in parallel
        const [res1, res2] = await Promise.all([
          fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/ID`),
          fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear + 1}/ID`)
        ]);

        if (res1.ok && res2.ok) {
          const data1 = await res1.json();
          const data2 = await res2.json();
          
          // Map to Date objects
          const allHolidays = [...data1, ...data2].map((h: { date: string }) => new Date(h.date));
          setHolidays(allHolidays);
        }
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      }
    };

    fetchHolidays();
  }, []);

  return (
    <div className={cn("p-3 bg-white rounded-xl border border-warm-200 shadow-sm", className)}>
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        disabled={{ before: new Date() }}
        showOutsideDays
        modifiers={{ holiday: holidays }}
        modifiersClassNames={{ holiday: 'rdp-day_holiday' }}
      />
    </div>
  );
}
