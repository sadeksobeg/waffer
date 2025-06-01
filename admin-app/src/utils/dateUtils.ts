import { format, formatDistance, formatRelative, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string, formatString: string = 'MMM d, yyyy'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date string to a relative format (e.g., "2 days ago")
 */
export const formatRelativeDate = (dateString: string, baseDate: Date = new Date()): string => {
  try {
    const date = parseISO(dateString);
    return formatDistance(date, baseDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return dateString;
  }
};

/**
 * Format a date string to a smart format (today, yesterday, or date)
 */
export const formatSmartDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    
    return formatRelative(date, new Date());
  } catch (error) {
    console.error('Error formatting smart date:', error);
    return dateString;
  }
};

/**
 * Get the start and end dates for a time range
 */
export const getDateRangeFromPeriod = (period: string): { start: Date; end: Date } => {
  const end = new Date();
  let start = new Date();
  
  switch (period) {
    case '7days':
      start.setDate(end.getDate() - 7);
      break;
    case '30days':
      start.setDate(end.getDate() - 30);
      break;
    case '90days':
      start.setDate(end.getDate() - 90);
      break;
    case '6months':
      start.setMonth(end.getMonth() - 6);
      break;
    case '1year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setDate(end.getDate() - 30); // Default to 30 days
  }
  
  // Set start time to beginning of day
  start.setHours(0, 0, 0, 0);
  
  // Set end time to end of day
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return date > new Date();
  } catch (error) {
    console.error('Error checking future date:', error);
    return false;
  }
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return date < new Date();
  } catch (error) {
    console.error('Error checking past date:', error);
    return false;
  }
};
