import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

/**
 * Tenant Isolation Enforcer:
 * Injects tenant context into request query / filter builder and verifies that users
 * cannot access or mutate resources outside their user ID or authorized organization ID.
 */
export const enforceTenantIsolation = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userId) {
    res.status(401).json({ success: false, message: 'Authentication required for tenant isolation' });
    return;
  }

  // Attach safe tenant filter criteria
  (req as any).tenantFilter = req.organizationId
    ? { $or: [{ userId: req.userId }, { organizationId: req.organizationId }] }
    : { userId: req.userId };

  next();
};
