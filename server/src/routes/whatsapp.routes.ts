import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { authenticateJwt } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';

const router = Router();

// Public Meta webhook endpoints
router.get('/webhook', WhatsAppController.verifyWebhook);
router.post('/webhook', WhatsAppController.handleWebhook);

// Protected endpoints
router.use(authenticateJwt);
router.use(enforceTenantIsolation);

router.get('/account', WhatsAppController.getAccount);
router.post('/configure', WhatsAppController.configureAccount);
router.post('/send-test', WhatsAppController.sendTestNotification);

export default router;
