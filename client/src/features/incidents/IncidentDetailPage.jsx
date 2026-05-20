import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Trash2 } from 'lucide-react';
import {
  fetchIncidentById,
  fetchComments,
  deleteIncident,
  clearSelected,
} from '../../store/slices/incidentsSlice.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import { SeverityBadge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { PageLoader } from '../../components/ui/LoadingSpinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { ActivityTimeline } from './ActivityTimeline.jsx';
import { CommentSection } from './CommentSection.jsx';
import { formatDate, formatDateTime, getAssigneeDisplay } from '../../utils/format.js';

export function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const incident = useSelector((s) => s.incidents.selected);
  const activity = useSelector((s) => s.incidents.activity);
  const comments = useSelector((s) => s.incidents.comments);
  const detailStatus = useSelector((s) => s.incidents.detailStatus);
  const { canEditIncident, canDeleteIncident } = usePermissions();

  useEffect(() => {
    dispatch(fetchIncidentById(id));
    dispatch(fetchComments(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this incident?')) return;
    await dispatch(deleteIncident(id));
    navigate('/incidents');
  };

  if (detailStatus === 'loading') return <PageLoader />;
  if (!incident) return <Alert variant="error">Incident not found</Alert>;

  const assigneeDeleted =
    incident.assigneeId &&
    incident.assigneeSnapshot?.name === 'Former User';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/incidents"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Incidents
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {incident.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            {incident.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {canEditIncident(incident) && (
            <Link to={`/incidents/${id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </Link>
          )}
          {canDeleteIncident() && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {assigneeDeleted && (
        <Alert variant="info">
          Assignee was removed from the organization. Showing last known assignee:{' '}
          <strong>{incident.assigneeSnapshot.name}</strong>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
            <h2 className="font-semibold text-slate-900 dark:text-white">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {incident.description || 'No description'}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
            <CommentSection incidentId={id} comments={comments} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
            <h2 className="font-semibold text-slate-900 dark:text-white">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Assignee</dt>
                <dd className="text-slate-800 dark:text-slate-200">{getAssigneeDisplay(incident)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Reporter</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {incident.reporterSnapshot?.name || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Due date</dt>
                <dd className="text-slate-800 dark:text-slate-200">{formatDate(incident.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {formatDateTime(incident.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Updated</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {formatDateTime(incident.updatedAt)}
                </dd>
              </div>
              {incident.resolvedAt && (
                <div>
                  <dt className="text-slate-500">Resolved</dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    {formatDateTime(incident.resolvedAt)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Reporter email</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {incident.reporterSnapshot?.email || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Version</dt>
                <dd className="font-mono text-slate-600 dark:text-slate-400">v{incident.version}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
            <h2 className="font-semibold text-slate-900 dark:text-white">Activity</h2>
            <div className="mt-4">
              <ActivityTimeline activities={activity} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
