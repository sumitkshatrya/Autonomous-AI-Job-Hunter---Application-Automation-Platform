import { AuthenticatedRequest } from './auth';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export async function logAuditEvent(
  req: AuthenticatedRequest,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  status: 'success' | 'failure' = 'success'
): Promise<void> {
  try {
    await AuditLog.create({
      userId: req.userId,
      organizationId: req.organizationId,
      action,
      resourceType,
      resourceId,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      details,
      status,
    });
  } catch (err) {
    logger.error('Failed to persist audit log:', err);
  }
}
