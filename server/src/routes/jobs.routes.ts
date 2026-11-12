import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/autopilot/status', JobsController.getAutopilotStatus);
router.post('/autopilot/trigger', JobsController.triggerAutopilotCycle);
router.post('/autopilot/toggle', JobsController.toggleAutopilot);

router.get('/', JobsController.listJobs);
router.get('/:id', JobsController.getJobById);
router.post('/discover', authenticateJwt, JobsController.triggerDiscovery);

export default router;
