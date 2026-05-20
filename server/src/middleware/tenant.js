import { fail } from '../shared/response.js';
import { getMembership } from '../services/organizationService.js';
import { isValidObjectId } from '../shared/objectId.js';

export async function requireTenant(req, res, next) {
  try {
    const orgId = req.headers['x-organization-id'] || req.activeOrganizationId;
    if (!orgId) {
      return fail(res, {
        status: 400,
        code: 'TENANT_REQUIRED',
        message: 'X-Organization-Id header is required',
      });
    }

    if (!isValidObjectId(orgId)) {
      return fail(res, {
        status: 400,
        code: 'INVALID_ORG_ID',
        message: 'Invalid organization id. Log out, clear site data, and log in again.',
      });
    }

    const membership = await getMembership(req.user.id, orgId);
  if (!membership) {
    return fail(res, {
      status: 403,
      code: 'FORBIDDEN',
      message: 'You do not have access to this organization',
    });
  }

    req.tenant = {
      organizationId: orgId,
      role: membership.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}
