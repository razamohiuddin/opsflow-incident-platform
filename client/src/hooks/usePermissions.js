import { useSelector } from 'react-redux';
import { ROLES } from '../constants/index.js';

const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'org:manage',
    'org:invite',
    'org:roles',
    'incident:create',
    'incident:update',
    'incident:delete',
    'incident:assign_any',
  ],
  [ROLES.MANAGER]: [
    'org:invite',
    'incident:create',
    'incident:update',
    'incident:delete',
    'incident:assign_any',
  ],
  [ROLES.DEVELOPER]: ['incident:create', 'incident:update', 'incident:assign_self'],
};

export function usePermissions() {
  const role = useSelector((s) => s.organization.active?.role);
  const userId = useSelector((s) => s.auth.user?.id);

  const can = (permission) => {
    if (!role) return false;
    return PERMISSIONS[role]?.includes(permission) ?? false;
  };

  const canEditIncident = (incident) => {
    if (!incident) return can('incident:update');
    if (can('incident:update') && can('incident:assign_any')) return true;
    if (role === ROLES.DEVELOPER) {
      return incident.reporterId === userId || incident.assigneeId === userId;
    }
    return can('incident:update');
  };

  const canDeleteIncident = () => can('incident:delete');

  return { role, can, canEditIncident, canDeleteIncident };
}
