import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { AutomationSettings } from '../models/AutomationSettings';
import { EmailAccount } from '../models/EmailAccount';
import { config } from '../config';
import { GoogleOAuthService } from '../services/GoogleOAuthService';
import { encrypt } from '../utils/crypto';
import { logger } from '../utils/logger';
import { RegisterSchema, LoginSchema, UserRole } from '@autoapply/shared';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAuditEvent } from '../middleware/audit';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const validated = RegisterSchema.parse(req.body);

    const existing = await User.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    let organizationId = undefined;
    let role: UserRole = 'individual';

    if (validated.organizationName) {
      const org = await Organization.create({
        name: validated.organizationName,
        slug: validated.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        ownerId: new User()._id,
        subscriptionTier: 'pro',
      });
      organizationId = org._id;
      role = 'saas_customer';
    }

    const user = await User.create({
      fullName: validated.fullName,
      email: validated.email.toLowerCase(),
      passwordHash,
      role,
      subscriptionTier: 'starter',
      organizationId,
      isActive: true,
      lastLoginAt: new Date(),
    });

    if (organizationId) {
      await Organization.findByIdAndUpdate(organizationId, { ownerId: user._id });
    }

    // Initialize default automation settings for user
    await AutomationSettings.create({
      userId: user._id,
      organizationId: user.organizationId,
      enabled: true,
      autoApplyThreshold: 75,
      dailyApplicationLimit: 50,
      dailyEmailOutreachLimit: 25,
      dailyWhatsAppLimit: 10,
    });

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, organizationId: user.organizationId?.toString() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        organizationId: user.organizationId,
      },
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const validated = LoginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email.toLowerCase() });
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, organizationId: user.organizationId?.toString() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    await logAuditEvent(
      { userId: user._id.toString(), ip: req.ip, headers: req.headers } as any,
      'USER_LOGIN',
      'User',
      user._id.toString()
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        organizationId: user.organizationId,
      },
    });
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        subscriptionTier: req.user.subscriptionTier,
        organizationId: req.user.organizationId,
        avatarUrl: req.user.avatarUrl,
        createdAt: req.user.createdAt,
      },
    });
  }

  public static async getGoogleAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || '';
      const authUrl = GoogleOAuthService.getInstance().getAuthUrl(userId);
      res.json({ success: true, authUrl });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getGoogleStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const account = await EmailAccount.findOne({
        $or: [
          ...(req.userId ? [{ userId: req.userId }] : []),
          { emailAddress: 'skumar21082001@gmail.com' },
        ],
        isActive: true,
      });

      if (account) {
        res.json({ success: true, connected: true, email: account.emailAddress });
      } else {
        res.json({ success: true, connected: false });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async syncLocalGoogle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const email = 'skumar21082001@gmail.com';
      let accessToken = '';
      let refreshToken = '';

      try {
        accessToken = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
        refreshToken = execSync('gcloud auth print-refresh-token', { encoding: 'utf8' }).trim();
      } catch (e: any) {
        logger.warn(`gcloud CLI token extraction notice: ${e.message}`);
      }

      if (!accessToken) {
        res.status(400).json({ success: false, message: 'Could not read local gcloud credentials' });
        return;
      }

      const accessTokenEncrypted = encrypt(accessToken);
      const refreshTokenEncrypted = refreshToken ? encrypt(refreshToken) : undefined;
      const tokenExpiresAt = new Date(Date.now() + 3600 * 1000);

      const account = await EmailAccount.findOneAndUpdate(
        {
          ...(req.userId ? { userId: req.userId } : {}),
          emailAddress: email,
        },
        {
          ...(req.userId ? { userId: req.userId } : {}),
          organizationId: req.organizationId,
          provider: 'gmail',
          emailAddress: email,
          accessTokenEncrypted,
          ...(refreshTokenEncrypted ? { refreshTokenEncrypted } : {}),
          tokenExpiresAt,
          dailyQuota: 50,
          isActive: true,
          isPrimary: true,
        },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Local Google credentials synced successfully', email: account.emailAddress });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code as string;
    const stateUserId = req.query.state as string;

    if (!code) {
      res.status(400).send('Missing authorization code in Google callback.');
      return;
    }

    try {
      const { emailAddress } = await GoogleOAuthService.getInstance().handleCallback(code, stateUserId);
      const redirectUrl = `${config.corsOrigin}/integrations?google=connected&email=${encodeURIComponent(emailAddress)}`;
      res.redirect(redirectUrl);
    } catch (err: any) {
      res.status(500).send(`Google OAuth Authorization Error: ${err.message}`);
    }
  }
}
