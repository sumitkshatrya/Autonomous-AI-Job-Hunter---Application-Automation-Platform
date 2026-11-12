import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { authenticateJwt } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router = Router();

router.use(authenticateJwt);
router.use(enforceTenantIsolation);

router.get('/accounts', EmailController.getAccounts);
router.post('/connect-smtp', EmailController.connectSmtp);
router.post('/simulate-reply', EmailController.simulateInboundReply);
router.post('/test-notification', EmailController.sendTestNotification);

export default router;
