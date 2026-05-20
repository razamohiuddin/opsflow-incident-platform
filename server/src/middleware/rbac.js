import { ROLE_PERMISSIONS } from '../shared/constants.js';
import { fail } from '../shared/response.js';
import { Incident } from '../models/Incident.js';

export function requirePermission(permission) {
  return (req, res, next) => {
    const perms = ROLE_PERMISSIONS[req.tenant?.role] || [];
    if (!perms.includes(permission)) {
      return fail(res, {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }
    next();
  };
}

export async function canUpdateIncident(req, res, next) {
  const perms = ROLE_PERMISSIONS[req.tenant.role] || [];
  if (perms.includes('incident:assign_any')) return next();

  const incident = await Incident.findOne({
    _id: req.params.id,
    organizationId: req.tenant.organizationId,
  });
  if (!incident) {
    return fail(res, { status: 404, code: 'NOT_FOUND', message: 'Incident not found' });
  }

  const userId = req.user.id;
  const isOwner =
    incident.reporterId.toString() === userId ||
    (incident.assigneeId && incident.assigneeId.toString() === userId);

  if (!isOwner) {
    return fail(res, {
      status: 403,
      code: 'FORBIDDEN',
      message: 'You can only edit incidents you reported or are assigned to',
    });
  }
  req.incident = incident;
  next();
}
