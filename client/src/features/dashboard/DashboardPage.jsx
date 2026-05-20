import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
} from 'lucide-react';
import { fetchDashboard } from '../../store/slices/dashboardSlice.js';
import { ROUTES, SEVERITY_LABELS } from '../../constants/index.js';
import { PageLoader } from '../../components/ui/LoadingSpinner.jsx';
import { formatDuration } from '../../utils/format.js';

const cardClass =
  'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none';

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className={cardClass}>
      <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function DashboardPage() {
  const dispatch = useDispatch();
  const { metrics, status } = useSelector((s) => s.dashboard);
  const org = useSelector((s) => s.organization.active);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch, org?.id]);

  if (status === 'loading' && !metrics) return <PageLoader />;

  const m = metrics || {
    openCount: 0,
    closedCount: 0,
    bySeverity: [],
    avgResolutionMs: 0,
    activeUsers: [],
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">{org?.name} — operational overview</p>
        </div>
        <Link
          to={ROUTES.INCIDENTS}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View all incidents <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={AlertCircle}
          label="Open incidents"
          value={m.openCount}
          color="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Closed incidents"
          value={m.closedCount}
          color="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
        />
        <MetricCard
          icon={Clock}
          label="Avg resolution time"
          value={formatDuration(m.avgResolutionMs)}
          color="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
        />
        <MetricCard
          icon={Users}
          label="Active contributors"
          value={m.activeUsers?.length || 0}
          sub="Last 30 days"
          color="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${cardClass} p-6`}>
          <h2 className="font-semibold text-slate-900 dark:text-white">By severity</h2>
          <ul className="mt-4 space-y-3">
            {m.bySeverity?.map(({ severity, count }) => (
              <li key={severity} className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">
                  {SEVERITY_LABELS[severity] || severity}
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.min(100, (count / (m.openCount + m.closedCount || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-sm text-slate-600 dark:text-slate-400">
                    {count}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${cardClass} p-6`}>
          <h2 className="font-semibold text-slate-900 dark:text-white">Most active users</h2>
          <ul className="mt-4 space-y-3">
            {m.activeUsers?.length ? (
              m.activeUsers.map((u, i) => (
                <li
                  key={u.userId}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-300">
                      {i + 1}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{u.name}</span>
                  </span>
                  <span className="text-sm text-slate-500">{u.count} actions</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No activity data yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
