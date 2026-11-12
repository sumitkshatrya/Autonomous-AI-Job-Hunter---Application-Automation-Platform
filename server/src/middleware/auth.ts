import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUserDocument } from '../models/User';
import { UserRole } from '@autoapply/shared';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
  userId?: string;
  organizationId?: string;
}

export const authenticateJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: UserRole;
      organizationId?: string;
    };

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User account not found or deactivated' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.organizationId = user.organizationId ? user.organizationId.toString() : undefined;
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions for this resource',
      });
      return;
    }

    next();
  };
};
