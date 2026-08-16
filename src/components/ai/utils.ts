export type InsightType = 'suggestion' | 'warning' | 'info';

export function getInsightBorderClass(type: InsightType): string {
  const typeStyles = {
    suggestion: 'border-l-accent-400',
    warning: 'border-l-warning-500',
    info: 'border-l-info-500',
  };
  return typeStyles[type];
}

export function getInsightIcon(type: InsightType): string {
  return type === 'warning' ? '⚠️' : type === 'suggestion' ? '✨' : '💡';
}
