import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateJwt } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router = Router();

router.use(authenticateJwt);
router.use(enforceTenantIsolation);

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

export default router;
