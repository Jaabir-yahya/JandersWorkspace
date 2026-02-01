import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_TENANT_FEATURES = {
  manual_transactions: true,
  entity_management: true,
  payment_records: true,
  dashboard: true,
  mpesa_integration: false,
  whatsapp_integration: false,
  quickbooks_sync: false,
  xero_sync: false,
  shopify_sync: false,
  advanced_reporting: false,
};

/**
 * Public tenant lookup for manual-only flow (no JWT).
 * Used by bridge-manual to resolve tenant from slug (subdomain or path).
 */
@Controller('tenants')
export class TenantsPublicController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('slug/:slug')
  async getTenantBySlug(@Param('slug') slug: string) {
    const tenant = await this.prismaService.tenant.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        tier: true,
        country: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug '${slug}' not found`);
    }

    const settings = tenant.settings as any;

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      tier: tenant.tier,
      country: tenant.country,
      settings: {
        businessType: settings?.businessType,
        location: settings?.location,
        features: settings?.features || DEFAULT_TENANT_FEATURES,
      },
      features: settings?.features || DEFAULT_TENANT_FEATURES,
    };
  }
}
