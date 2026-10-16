import { format, isToday, isTomorrow, isYesterday, isPast, parseISO, isValid } from 'date-fns';

export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(d)) return '';
    return format(d, 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function formatRelativeDate(dateString) {
  if (!dateString) return '';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(d)) return '';
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  } catch {
    return '';
  }
}

export function isOverdue(dateString) {
  if (!dateString) return false;
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(d)) return false;
    return isPast(d) && !isToday(d);
  } catch {
    return false;
  }
}

export function toISODate(date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}
