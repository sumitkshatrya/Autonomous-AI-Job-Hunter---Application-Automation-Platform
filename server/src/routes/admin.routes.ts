import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJwt, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(['admin']));

router.get('/overview', AdminController.getSystemOverview);
router.get('/audit-logs', AdminController.listAuditLogs);
router.get('/users', AdminController.listUsers);

export default router;
