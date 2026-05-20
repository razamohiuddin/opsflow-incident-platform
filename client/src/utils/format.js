import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(iso) {
  if (!iso) return '—';
  return format(new Date(iso), 'MMM d, yyyy');
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return format(new Date(iso), 'MMM d, yyyy HH:mm');
}

export function formatRelative(iso) {
  if (!iso) return '';
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatDuration(ms) {
  if (!ms) return '—';
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  return `${hours}h`;
}

export function getAssigneeDisplay(incident) {
  if (incident.assigneeSnapshot) {
    return incident.assigneeSnapshot.name;
  }
  if (incident.assigneeId) return 'Unknown user';
  return 'Unassigned';
}

export function parseTagsInput(value) {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}
