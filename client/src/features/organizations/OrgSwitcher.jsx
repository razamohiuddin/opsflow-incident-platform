import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Building2 } from 'lucide-react';
import { switchOrganization } from '../../store/slices/organizationSlice.js';
import { fetchDashboard } from '../../store/slices/dashboardSlice.js';
import { fetchIncidents } from '../../store/slices/incidentsSlice.js';

export function OrgSwitcher() {
  const dispatch = useDispatch();
  const list = useSelector((s) => s.organization.list.length ? s.organization.list : s.auth.organizations);
  const active = useSelector((s) => s.organization.active);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSwitch = async (org) => {
    if (org.id === active?.id) {
      setOpen(false);
      return;
    }
    setLoading(true);
    await dispatch(switchOrganization(org.id));
    await Promise.all([
      dispatch(fetchDashboard()),
      dispatch(fetchIncidents({})),
    ]);
    setLoading(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-none dark:hover:border-slate-600"
      >
        <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {active?.name || 'Select organization'}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <ul className="absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {list.map((org) => (
              <li key={org.id}>
                <button
                  type="button"
                  onClick={() => handleSwitch(org)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    org.id === active?.id
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {org.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
