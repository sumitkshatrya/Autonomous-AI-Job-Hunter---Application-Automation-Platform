import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import jobsRoutes from './jobs.routes';
import matchingRoutes from './matching.routes';
import applicationsRoutes from './applications.routes';
import recruiterRoutes from './recruiter.routes';
import emailRoutes from './email.routes';
import whatsappRoutes from './whatsapp.routes';
import analyticsRoutes from './analytics.routes';
import settingsRoutes from './settings.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/jobs', jobsRoutes);
router.use('/matching', matchingRoutes);
router.use('/applications', applicationsRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/email', emailRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/admin', adminRoutes);

export default router;
