import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../../components/ui/Badge.jsx';
import { formatDate, getAssigneeDisplay } from '../../utils/format.js';

function truncateText(text, maxLength = 120) {
  if (!text) return '';
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

function incidentDetailPath(id) {
  return `/incidents/${id}`;
}

export function IncidentTable({ incidents }) {
  const navigate = useNavigate();

  if (!incidents.length) return null;

  const goToDetail = (id) => navigate(incidentDetailPath(id));

  const handleRowKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToDetail(id);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-transparent dark:shadow-none">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            <th className="px-4 py-3 font-medium">Incident</th>
            <th className="px-4 py-3 font-medium">Severity</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Assignee</th>
            <th className="px-4 py-3 font-medium">Due</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="w-10 px-2 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr
              key={inc.id}
              role="link"
              tabIndex={0}
              onClick={() => goToDetail(inc.id)}
              onKeyDown={(e) => handleRowKeyDown(e, inc.id)}
              className="cursor-pointer border-b border-slate-100 transition hover:bg-indigo-50/60 focus:bg-indigo-50/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/40 dark:border-slate-800/80 dark:hover:bg-indigo-950/30 dark:focus:bg-indigo-950/30"
              aria-label={`View incident: ${inc.title}`}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900 group-hover:text-indigo-700 dark:text-slate-100">
                  {inc.title}
                </p>
                {inc.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {truncateText(inc.description)}
                  </p>
                )}
                {inc.tags?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {inc.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={inc.severity} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={inc.status} />
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                {getAssigneeDisplay(inc)}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {formatDate(inc.dueDate)}
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(inc.updatedAt)}</td>
              <td className="px-2 py-3 text-slate-400 dark:text-slate-500">
                <ChevronRight className="h-4 w-4" aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
