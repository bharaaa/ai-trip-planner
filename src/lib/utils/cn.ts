import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  // Using twMerge as well is a common best practice with clsx for tailwind
  return twMerge(clsx(inputs));
}
