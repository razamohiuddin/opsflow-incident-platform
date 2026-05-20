export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/',
  INCIDENTS: '/incidents',
  INCIDENT_NEW: '/incidents/new',
  INCIDENT_DETAIL: '/incidents/:id',
  INCIDENT_EDIT: '/incidents/:id/edit',
  ORG_SETTINGS: '/settings/organization',
  INVITE_ACCEPT: '/invite/accept',
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer',
};

export const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  developer: 'Developer',
};

export const INCIDENT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

export const STATUS_COLORS = {
  open: 'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-violet-500/20 text-violet-300',
  resolved: 'bg-emerald-500/20 text-emerald-300',
  closed: 'bg-slate-500/20 text-slate-400',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'opsflow_access_token',
  REFRESH_TOKEN: 'opsflow_refresh_token',
  ACTIVE_ORG_ID: 'opsflow_active_org_id',
  THEME: 'opsflow_theme',
};

export const DEFAULT_PAGE_SIZE = 10;
