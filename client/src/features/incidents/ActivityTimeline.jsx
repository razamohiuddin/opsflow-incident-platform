import { formatRelative } from '../../utils/format.js';
import {
  Plus,
  ArrowRightLeft,
  AlertTriangle,
  MessageSquare,
  UserPlus,
} from 'lucide-react';

const ICONS = {
  'incident.created': Plus,
  severity_changed: AlertTriangle,
  status_changed: ArrowRightLeft,
  assignee_changed: UserPlus,
  'comment.added': MessageSquare,
};

export function ActivityTimeline({ activities }) {
  if (!activities?.length) {
    return <p className="text-sm text-slate-500">No activity yet</p>;
  }

  return (
    <ul className="space-y-4">
      {activities.map((item) => {
        const Icon = ICONS[item.action] || ArrowRightLeft;
        return (
          <li key={item.id} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-800 dark:text-slate-200">{item.message}</p>
              <p className="text-xs text-slate-500">{formatRelative(item.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
