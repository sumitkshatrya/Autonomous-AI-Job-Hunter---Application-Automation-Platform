import { Router } from 'express';
import { RecruiterController } from '../controllers/recruiter.controller';
import { authenticateJwt } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router = Router();

// Public webhook for recruiter opt-out/unsubscribe
router.post('/opt-out', RecruiterController.optOutWebhook);

// Protected routes
router.use(authenticateJwt);
router.use(enforceTenantIsolation);

router.get('/contacts', RecruiterController.listContacts);
router.post('/discover', RecruiterController.discoverContacts);
router.get('/messages', RecruiterController.listMessages);
router.post('/send', RecruiterController.sendOutreach);

export default router;
