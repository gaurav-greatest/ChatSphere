import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Format a date for chat message timestamps.
 * Shows "Just now", "2m ago", "5:30 PM", "Yesterday", or full date.
 */
export const formatMessageTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;

  return format(d, 'MMM d, h:mm a');
};

/**
 * Format a date for chat list (last message time).
 */
export const formatChatListTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return format(d, 'EEEE');

  return format(d, 'MM/dd/yyyy');
};

/**
 * Format "last seen" time for user profiles.
 */
export const formatLastSeen = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `Last seen ${formatDistanceToNow(d, { addSuffix: true })}`;
};
