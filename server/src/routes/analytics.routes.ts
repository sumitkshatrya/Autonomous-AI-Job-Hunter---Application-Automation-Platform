import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJwt } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router = Router();

router.use(authenticateJwt);
router.use(enforceTenantIsolation);

router.get('/metrics', AnalyticsController.getMetrics);
router.get('/activity', AnalyticsController.getActivityFeed);

export default router;
