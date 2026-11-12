import { describe, it, expect } from 'vitest';
import { enforceTenantIsolation } from '../src/middleware/tenantIsolation';

describe('Security & Multi-Tenant Isolation', () => {
  it('should enforce tenant isolation filter on queries', () => {
    const mockReq: any = {
      userId: 'user_123',
      organizationId: 'org_456',
    };
    const mockRes: any = {};
    let nextCalled = false;

    enforceTenantIsolation(mockReq, mockRes, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(mockReq.tenantFilter).toEqual({
      $or: [{ userId: 'user_123' }, { organizationId: 'org_456' }],
    });
  });

  it('should enforce user isolation when user does not belong to an organization', () => {
    const mockReq: any = {
      userId: 'solo_user_789',
    };
    const mockRes: any = {};
    let nextCalled = false;

    enforceTenantIsolation(mockReq, mockRes, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(mockReq.tenantFilter).toEqual({ userId: 'solo_user_789' });
  });

  it('should reject unauthenticated requests before querying tenant resources', () => {
    const mockReq: any = {};
    let statusSet = 0;
    let jsonResult: any = null;
    const mockRes: any = {
      status: (code: number) => {
        statusSet = code;
        return {
          json: (data: any) => {
            jsonResult = data;
          },
        };
      },
    };

    enforceTenantIsolation(mockReq, mockRes, () => {});

    expect(statusSet).toBe(401);
    expect(jsonResult.success).toBe(false);
  });
});
