import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import { requirePermission } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createOrgSchema, inviteSchema, acceptInviteSchema } from './org.validation.js';
import * as ctrl from './org.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.listOrganizations);
router.post('/', validate(createOrgSchema), ctrl.createOrganization);
router.post('/invites/accept', validate(acceptInviteSchema), ctrl.acceptInvite);
router.post('/:id/switch', ctrl.switchOrganization);

router.get('/members', requireTenant, ctrl.listMembers);
router.get('/invites', requireTenant, ctrl.listInvites);
router.post(
  '/invites',
  requireTenant,
  requirePermission('org:invite'),
  validate(inviteSchema),
  ctrl.createInvite
);

export default router;
