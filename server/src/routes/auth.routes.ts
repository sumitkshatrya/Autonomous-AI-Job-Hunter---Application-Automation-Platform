import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.get('/me', authenticateJwt, AuthController.getMe);
router.get('/google/url', AuthController.getGoogleAuthUrl);
router.get('/google/callback', AuthController.handleGoogleCallback);
router.get('/google/status', authenticateJwt, AuthController.getGoogleStatus);
router.post('/google/sync-local', authenticateJwt, AuthController.syncLocalGoogle);

export default router;
