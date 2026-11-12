import { Router } from 'express';
import { MatchingController } from '../controllers/matching.controller';
import { authenticateJwt } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router = Router();

router.use(authenticateJwt);
router.use(enforceTenantIsolation);

router.get('/recommendations', MatchingController.getRecommendations);
router.post('/evaluate', MatchingController.triggerMatching);
router.post('/dismiss/:jobId', MatchingController.dismissMatch);

export default router;
