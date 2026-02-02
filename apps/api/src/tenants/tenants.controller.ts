import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TenantConfigService } from '../integrations/tenant-config.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from './tenants.service';
import { TenantTier, TenantCountry } from '../integrations/types/integration.types';

// Default features for new manual-only tenants (Nairobi focus)
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

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly prismaService: PrismaService,
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Get current tenant's features
   * Returns what features the tenant has access to
   */
  @Get('features')
  async getMyFeatures(@Request() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }

    return this.tenantConfigService.getTenantFeatures(tenantId);
  }

  /**
   * Get current tenant's configuration
   */
  @Get('config')
  async getMyConfig(@Request() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }

    return this.tenantConfigService.getTenantConfig(tenantId);
  }

  /**
   * Create a new tenant (manual-only by default)
   * This is for Nairobi manual use case - new tenants get manual features only
   */
  @Post()
  async createTenant(
    @Body() body: {
      name: string;
      slug: string;
      phoneNumber: string;
      email?: string;
      displayName: string;
    },
    @Request() req: any,
  ) {
    // Only admins can create tenants (or in future, this could be public signup)
    // For now, restrict to existing admin users
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Only admins can create new tenants');
    }

    const { name, slug, phoneNumber, email, displayName } = body;

    // Validate required fields
    if (!name || !slug || !phoneNumber || !displayName) {
      throw new BadRequestException('Missing required fields: name, slug, phoneNumber, displayName');
    }

    // Check if slug is already taken
    const existingTenant = await this.prismaService.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new BadRequestException(`Tenant slug '${slug}' is already taken`);
    }

    // Create tenant with manual-only features (Nairobi use case)
    const tenant = await this.prismaService.tenant.create({
      data: {
        name,
        slug,
        tier: 'BASIC', // Manual users start on BASIC tier
        country: 'KE', // Nairobi/Kenya focus
        isActive: true,
        settings: {
          commissionRates: {
            mpesa: 0.02,
            whatsapp: 0.01,
            quickbooks: 0.015,
            xero: 0.015,
            shopify: 0.01,
          },
          complianceData: {
            dataRetention: { years: 7, anonymization: true },
            mpesaCompliance: { kycRequired: true, amlChecks: true, reportingThreshold: 1000000 },
          },
          rateLimits: { daily: 1000, monthly: 30000 },
          features: DEFAULT_TENANT_FEATURES,
        },
      },
    });

    // Create admin user for the new tenant
    const user = await this.prismaService.user.create({
      data: {
        tenantId: tenant.id,
        phoneNumber,
        email: email || `${phoneNumber}@placeholder.local`,
        displayName,
        role: 'admin',
        metadata: { is_tenant_owner: true },
      },
    });

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        tier: tenant.tier,
        country: tenant.country,
      },
      user: {
        id: user.id,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      features: DEFAULT_TENANT_FEATURES,
      message: 'Tenant created successfully with manual-only features. Contact support to enable integrations.',
    };
  }

  /**
   * Request integration access (for manual tenants to upgrade)
   * This creates a request that can be reviewed by admin
   */
  @Post('request-integration')
  async requestIntegration(
    @Body() body: { integrationType: string; reason: string },
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }

    const { integrationType, reason } = body;

    // Validate integration type
    const validIntegrations = ['MPESA', 'WHATSAPP', 'QUICKBOOKS', 'XERO', 'SHOPIFY'];
    if (!validIntegrations.includes(integrationType.toUpperCase())) {
      throw new BadRequestException(`Invalid integration type. Must be one of: ${validIntegrations.join(', ')}`);
    }

    // In a real implementation, this would create a request record
    // For now, return a message indicating the request was received
    return {
      success: true,
      message: `Request for ${integrationType} integration received. Our team will review and contact you.`,
      request: {
        tenantId,
        integrationType: integrationType.toUpperCase(),
        reason,
        status: 'PENDING_REVIEW',
        requestedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * List all tenants (admin only)
   */
  @Get()
  async listTenants(@Request() req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Only admins can list all tenants');
    }

    const tenants = await this.prismaService.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        tier: true,
        country: true,
        createdAt: true,
        settings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map(tenant => ({
      ...tenant,
      features: (tenant.settings as any)?.features || DEFAULT_TENANT_FEATURES,
    }));
  }

  /**
   * Set API key for a tenant (admin only). Used for deployment-ready Option B: share key with Nairobi locals.
   */
  @Patch(':id/api-key')
  async setTenantApiKey(
    @Param('id') tenantId: string,
    @Body() body: { apiKey: string },
    @Request() req: any,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Only admins can set tenant API key');
    }
    if (!body?.apiKey?.trim()) {
      throw new BadRequestException('apiKey is required');
    }
    const tenant = await this.prismaService.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }
    await this.tenantsService.setTenantApiKey(tenantId, body.apiKey);
    return { success: true, message: 'API key set. Share the key with the tenant (e.g. via link ?key=...).' };
  }
}
