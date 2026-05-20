import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Settings,
  Zap,
} from 'lucide-react';
import { ROUTES } from '../../constants/index.js';
import { isMockMode } from '../../services/api.js';

const nav = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.INCIDENTS, label: 'Incidents', icon: AlertTriangle },
  { to: ROUTES.ORG_SETTINGS, label: 'Organization', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">OpsFlow</p>
          <p className="text-xs text-slate-500">Incident platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-600/20 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {isMockMode() && (
        <div className="m-3 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Mock API — set VITE_USE_MOCK=false when backend is ready
        </div>
      )}
    </aside>
  );
}
