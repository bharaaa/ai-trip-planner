export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateRange(start?: Date, end?: Date): string {
  if (!start && !end) return 'Dates TBD';
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  if (start && !end) return `${start.toLocaleDateString('en-US', options)} - TBD`;
  if (!start && end) return `TBD - ${end.toLocaleDateString('en-US', options)}`;
  
  if (start && end) {
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', options)} - ${end.getDate()}`;
    }
    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    }
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }
  return '';
}

export function formatDuration(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatBudgetRange(min: number, max: number, currency: string = 'IDR'): string {
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
}
