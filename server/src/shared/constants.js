export const ROLES = ['admin', 'manager', 'developer'];

export const INCIDENT_STATUS = ['open', 'in_progress', 'resolved', 'closed'];

export const SEVERITY = ['critical', 'high', 'medium', 'low'];

export const ROLE_PERMISSIONS = {
  admin: [
    'org:manage',
    'org:invite',
    'org:roles',
    'incident:create',
    'incident:update',
    'incident:delete',
    'incident:assign_any',
    'comment:create',
  ],
  manager: [
    'org:invite',
    'incident:create',
    'incident:update',
    'incident:delete',
    'incident:assign_any',
    'comment:create',
  ],
  developer: ['incident:create', 'incident:update', 'incident:assign_self', 'comment:create'],
};
