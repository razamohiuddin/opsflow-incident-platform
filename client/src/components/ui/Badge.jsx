import { SEVERITY_COLORS, STATUS_COLORS } from '../../constants/index.js';

export function SeverityBadge({ severity }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_COLORS[severity] || 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status] || 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}

export function RoleBadge({ role }) {
  const colors = {
    admin:
      'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    developer:
      'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${colors[role]}`}>
      {role}
    </span>
  );
}
