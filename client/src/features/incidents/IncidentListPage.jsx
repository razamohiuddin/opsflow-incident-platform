import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, AlertTriangle } from 'lucide-react';
import { fetchIncidents, setPage } from '../../store/slices/incidentsSlice.js';
import { loadMembers } from '../../store/slices/organizationSlice.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import { ROUTES } from '../../constants/index.js';
import { IncidentFilters } from './IncidentFilters.jsx';
import { IncidentTable } from './IncidentTable.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { PageLoader } from '../../components/ui/LoadingSpinner.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';

export function IncidentListPage() {
  const dispatch = useDispatch();
  const { items, meta, filters, status } = useSelector((s) => s.incidents);
  const members = useSelector((s) => s.organization.members);
  const orgId = useSelector((s) => s.organization.active?.id);
  const { can } = usePermissions();
  const debouncedQ = useDebounce(filters.q, 300);

  useEffect(() => {
    dispatch(loadMembers());
  }, [dispatch, orgId]);

  useEffect(() => {
    const params = {
      ...filters,
      q: debouncedQ,
      page: filters.page,
      limit: filters.limit,
    };
    Object.keys(params).forEach((k) => {
      if (params[k] === '' || params[k] == null) delete params[k];
    });
    dispatch(fetchIncidents(params));
  }, [dispatch, orgId, debouncedQ, filters.status, filters.severity, filters.assigneeId, filters.from, filters.to, filters.sort, filters.order, filters.page, filters.limit]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Incidents</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {meta.total} total — filter, search, and sort
          </p>
        </div>
        {can('incident:create') && (
          <Link to={ROUTES.INCIDENT_NEW}>
            <Button>
              <Plus className="h-4 w-4" /> New incident
            </Button>
          </Link>
        )}
      </div>

      <IncidentFilters members={members} />

      {status === 'loading' ? (
        <PageLoader />
      ) : items.length ? (
        <>
          <IncidentTable incidents={items} />
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => dispatch(setPage(p))}
          />
        </>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents found"
          description="Adjust filters or create a new incident"
          action={
            can('incident:create') && (
              <Link to={ROUTES.INCIDENT_NEW}>
                <Button>Create incident</Button>
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
