import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils/cn';

interface DateRangePickerProps {
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  className?: string;
  theme?: 'light' | 'dark';
}

export function DateRangePicker({ selected, onSelect, className, theme = 'light' }: DateRangePickerProps) {
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

  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "p-3 rounded-xl shadow-sm",
      isDark ? "bg-white/5 border border-white/10 text-white [&_.rdp-day_button:hover]:bg-white/10 [&_.rdp-day_selected]:bg-accent-500 [&_.rdp-day_selected]:text-white [&_.rdp-nav_button:hover]:bg-white/10 [&_.rdp-caption_label]:text-white [&_.rdp-head_cell]:text-white/50 [&_.rdp-day]:text-white/80 [&_.rdp-day_outside]:text-white/30" : "bg-white border border-warm-200 text-warm-900",
      className
    )}>
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
