import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = 'Select an option', className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2.5 bg-white border rounded-[var(--radius-md)] text-left transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-accent-400",
          isOpen ? "border-accent-400 ring-2 ring-accent-400/20" : "border-warm-200/80 hover:border-warm-300",
          !selectedOption && "text-warm-500"
        )}
      >
        <span className={cn("block truncate font-medium text-sm", selectedOption ? "text-warm-900" : "text-warm-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-warm-400 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-warm-200/80 rounded-[var(--radius-md)] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative cursor-default select-none py-2.5 pl-9 pr-4 text-sm font-medium transition-colors hover:bg-warm-50",
                  option.value === value ? "text-accent-600 bg-accent-50/50" : "text-warm-700"
                )}
              >
                <span className="block truncate">{option.label}</span>
                {option.value === value && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-600">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
