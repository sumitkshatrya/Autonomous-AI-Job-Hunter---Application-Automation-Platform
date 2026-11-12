import { Router } from 'express';
import { ApplicationsController } from '../controllers/applications.controller';
import { authenticateJwt } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router = Router();

router.use(authenticateJwt);
router.use(enforceTenantIsolation);

router.get('/', ApplicationsController.listApplications);
router.get('/:id', ApplicationsController.getApplicationById);
router.post('/generate', ApplicationsController.generateApplication);
router.post('/:id/submit', ApplicationsController.submitApplication);
router.patch('/:id/status', ApplicationsController.updateStatus);

export default router;
