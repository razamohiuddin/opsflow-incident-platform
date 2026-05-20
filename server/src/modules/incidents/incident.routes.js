import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import { requirePermission, canUpdateIncident } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  createIncidentSchema,
  updateIncidentSchema,
  listIncidentsSchema,
  commentSchema,
} from './incident.validation.js';
import * as ctrl from './incident.controller.js';
import { uploadAttachment } from '../uploads/upload.controller.js';
import { uploadMiddleware } from '../uploads/upload.middleware.js';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/', validate(listIncidentsSchema, 'query'), ctrl.listIncidents);
router.post('/', requirePermission('incident:create'), validate(createIncidentSchema), ctrl.createIncident);
router.get('/:id', ctrl.getIncident);
router.patch(
  '/:id',
  canUpdateIncident,
  validate(updateIncidentSchema),
  ctrl.updateIncident
);
router.delete('/:id', requirePermission('incident:delete'), ctrl.deleteIncident);
router.get('/:id/comments', ctrl.listComments);
router.post(
  '/:id/comments',
  requirePermission('comment:create'),
  validate(commentSchema),
  ctrl.addComment
);
router.post(
  '/:id/attachments',
  requirePermission('incident:update'),
  uploadMiddleware.single('file'),
  uploadAttachment
);

export default router;
