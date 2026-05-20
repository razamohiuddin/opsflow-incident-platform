import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createIncident,
  updateIncident,
  fetchIncidentById,
  clearSelected,
} from '../../store/slices/incidentsSlice.js';
import { loadMembers } from '../../store/slices/organizationSlice.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import {
  INCIDENT_STATUS,
  SEVERITY,
  STATUS_LABELS,
  SEVERITY_LABELS,
} from '../../constants/index.js';
import { parseTagsInput } from '../../utils/format.js';
import { uploadAttachment } from '../../services/incidentService.js';
import { isMockMode } from '../../services/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { PageLoader } from '../../components/ui/LoadingSpinner.jsx';

const emptyForm = {
  title: '',
  description: '',
  severity: SEVERITY.MEDIUM,
  status: INCIDENT_STATUS.OPEN,
  tags: '',
  assigneeId: '',
  dueDate: '',
};

export function IncidentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selected = useSelector((s) => s.incidents.selected);
  const detailStatus = useSelector((s) => s.incidents.detailStatus);
  const members = useSelector((s) => s.organization.members);
  const { canEditIncident } = usePermissions();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    dispatch(loadMembers());
    if (isEdit) dispatch(fetchIncidentById(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (selected && isEdit) {
      setForm({
        title: selected.title,
        description: selected.description,
        severity: selected.severity,
        status: selected.status,
        tags: (selected.tags || []).join(', '),
        assigneeId: selected.assigneeId || '',
        dueDate: selected.dueDate ? selected.dueDate.slice(0, 10) : '',
      });
    }
  }, [selected, isEdit]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      status: form.status,
      tags: parseTagsInput(form.tags),
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };

    setLoading(true);
    setError('');

    if (isEdit) {
      const result = await dispatch(
        updateIncident({ id, data: { ...payload, version: selected.version } })
      );
      if (updateIncident.rejected.match(result)) {
        setError(
          result.payload === 'CONFLICT'
            ? 'Someone else updated this incident. Refresh and try again.'
            : result.payload || 'Update failed'
        );
        setLoading(false);
        return;
      }
      navigate(`/incidents/${id}`);
    } else {
      const result = await dispatch(createIncident(payload));
      if (createIncident.rejected.match(result)) {
        setError(result.payload || 'Create failed');
        setLoading(false);
        return;
      }
      const incidentId = result.payload.id;
      if (attachments.length > 0 && !isMockMode()) {
        for (const file of attachments) {
          try {
            await uploadAttachment(incidentId, file);
          } catch (uploadErr) {
            console.error('Attachment upload failed', uploadErr);
          }
        }
      }
      navigate(`/incidents/${incidentId}`);
    }
    setLoading(false);
  };

  if (isEdit && detailStatus === 'loading') return <PageLoader />;
  if (isEdit && selected && !canEditIncident(selected)) {
    return <Alert variant="error">You do not have permission to edit this incident.</Alert>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to={isEdit ? `/incidents/${id}` : '/incidents'}
          className="text-sm text-indigo-600 dark:text-indigo-400"
        >
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Edit incident' : 'New incident'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none"
      >
        {error && <Alert variant="error">{error}</Alert>}

        <Input label="Title *" value={form.title} onChange={update('title')} required />
        <Textarea
          label="Description"
          value={form.description}
          onChange={update('description')}
          rows={5}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Severity" value={form.severity} onChange={update('severity')}>
            {Object.values(SEVERITY).map((s) => (
              <option key={s} value={s}>
                {SEVERITY_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select label="Status" value={form.status} onChange={update('status')}>
            {Object.values(INCIDENT_STATUS).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>

        <Select label="Assignee" value={form.assigneeId} onChange={update('assigneeId')}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>

        <Input label="Due date" type="date" value={form.dueDate} onChange={update('dueDate')} />
        <Input
          label="Tags (comma-separated)"
          value={form.tags}
          onChange={update('tags')}
          placeholder="api, production"
        />

        {!isEdit && (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Attachments (optional)
            </label>
            <input
              type="file"
              multiple
              className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:text-white"
              onChange={(e) => setAttachments([...e.target.files])}
            />
            {attachments.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                {attachments.length} file(s) selected — uploaded after incident is created
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            {isEdit ? 'Save changes' : 'Create incident'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
