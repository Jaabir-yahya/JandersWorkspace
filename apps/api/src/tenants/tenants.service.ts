import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Optional tenant API key validation for deployment-ready auth (Option B).
 * When X-Tenant-Key is sent and tenant has api_key_hash set, validate; otherwise allow.
 */
@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  static hashKey(plainKey: string): string {
    return createHash('sha256').update(plainKey.trim()).digest('hex');
  }

  async validateTenantKey(
    tenantId: string,
    plainKey: string | undefined,
  ): Promise<boolean> {
    if (!plainKey?.trim()) return true;
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { apiKeyHash: true },
    });
    if (!tenant?.apiKeyHash) return true;
    const hash = TenantsService.hashKey(plainKey);
    return hash === tenant.apiKeyHash;
  }

  async assertTenantKeyIfPresent(
    tenantId: string,
    plainKey: string | undefined,
  ): Promise<void> {
    const ok = await this.validateTenantKey(tenantId, plainKey);
    if (!ok) {
      throw new UnauthorizedException('Invalid or missing tenant key');
    }
  }

  async setTenantApiKey(tenantId: string, plainKey: string): Promise<void> {
    const hash = TenantsService.hashKey(plainKey);
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { apiKeyHash: hash },
    });
  }

  /**
   * Returns tenant IDs the user can access (users linked by email).
   * Used to allow X-Tenant-Id / query tenant_id when user has no tenant in JWT.
   */
  async getTenantIdsForUser(userEmail: string): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: { email: userEmail },
      select: { tenantId: true },
    });
    return [
      ...new Set(users.map((u) => u.tenantId).filter(Boolean)),
    ] as string[];
  }

  /**
   * Resolve effective tenant: X-Tenant-Id or query tenant_id if user has access, else JWT tenant.
   */
  async resolveEffectiveTenantId(
    jwtTenantId: string | undefined,
    headerTenantId: string | undefined,
    userEmail: string,
  ): Promise<string | null> {
    const requested = headerTenantId?.trim();
    if (requested) {
      const allowed = await this.getTenantIdsForUser(userEmail);
      if (allowed.includes(requested)) return requested;
    }
    return jwtTenantId?.trim() || null;
  }
}
