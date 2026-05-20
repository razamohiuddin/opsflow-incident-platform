import { useDispatch, useSelector } from 'react-redux';
import { Search, RotateCcw } from 'lucide-react';
import { setFilters, resetFilters } from '../../store/slices/incidentsSlice.js';
import { STATUS_LABELS, SEVERITY_LABELS, INCIDENT_STATUS, SEVERITY } from '../../constants/index.js';
import { Input, Select, SearchInput } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function IncidentFilters({ members, onSearchChange }) {
  const dispatch = useDispatch();
  const filters = useSelector((s) => s.incidents.filters);

  const update = (patch) => {
    dispatch(setFilters(patch));
    if (patch.q !== undefined) onSearchChange?.(patch.q);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
      <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <SearchInput
          label="Search"
          icon={Search}
          placeholder="Search by title..."
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
          className="lg:col-span-2"
        />

        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          {Object.values(INCIDENT_STATUS).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>

        <Select
          label="Severity"
          value={filters.severity}
          onChange={(e) => update({ severity: e.target.value })}
        >
          <option value="">All severities</option>
          {Object.values(SEVERITY).map((s) => (
            <option key={s} value={s}>
              {SEVERITY_LABELS[s]}
            </option>
          ))}
        </Select>

        <Select
          label="Assignee"
          value={filters.assigneeId}
          onChange={(e) => update({ assigneeId: e.target.value })}
        >
          <option value="">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {members?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>

        <Input
          label="From date"
          type="date"
          value={filters.from}
          onChange={(e) => update({ from: e.target.value })}
        />

        <Input
          label="To date"
          type="date"
          value={filters.to}
          onChange={(e) => update({ to: e.target.value })}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Select
          label="Sort by"
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="max-w-[180px]"
        >
          <option value="createdAt">Created</option>
          <option value="dueDate">Due date</option>
          <option value="severity">Severity</option>
          <option value="status">Status</option>
        </Select>

        <Select
          label="Order"
          value={filters.order}
          onChange={(e) => update({ order: e.target.value })}
          className="max-w-[120px]"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </Select>

        <Button variant="ghost" size="sm" onClick={() => dispatch(resetFilters())} className="mt-6">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
