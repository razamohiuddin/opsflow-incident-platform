import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import * as ctrl from './dashboard.controller.js';

const router = Router();

router.get('/metrics', authenticate, requireTenant, ctrl.getMetrics);

export default router;
