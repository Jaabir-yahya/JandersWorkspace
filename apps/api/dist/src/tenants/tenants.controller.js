"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const tenant_config_service_1 = require("../integrations/tenant-config.service");
const prisma_service_1 = require("../prisma/prisma.service");
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
let TenantsController = class TenantsController {
    tenantConfigService;
    prismaService;
    constructor(tenantConfigService, prismaService) {
        this.tenantConfigService = tenantConfigService;
        this.prismaService = prismaService;
    }
    async getMyFeatures(req) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID not found in request');
        }
        return this.tenantConfigService.getTenantFeatures(tenantId);
    }
    async getMyConfig(req) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID not found in request');
        }
        return this.tenantConfigService.getTenantConfig(tenantId);
    }
    async createTenant(body, req) {
        if (req.user?.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can create new tenants');
        }
        const { name, slug, phoneNumber, email, displayName } = body;
        if (!name || !slug || !phoneNumber || !displayName) {
            throw new common_1.BadRequestException('Missing required fields: name, slug, phoneNumber, displayName');
        }
        const existingTenant = await this.prismaService.tenant.findUnique({
            where: { slug },
        });
        if (existingTenant) {
            throw new common_1.BadRequestException(`Tenant slug '${slug}' is already taken`);
        }
        const tenant = await this.prismaService.tenant.create({
            data: {
                name,
                slug,
                tier: 'BASIC',
                country: 'KE',
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
        const user = await this.prismaService.user.create({
            data: {
                tenantId: tenant.id,
                phoneNumber,
                email: email || null,
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
    async requestIntegration(body, req) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID not found in request');
        }
        const { integrationType, reason } = body;
        const validIntegrations = ['MPESA', 'WHATSAPP', 'QUICKBOOKS', 'XERO', 'SHOPIFY'];
        if (!validIntegrations.includes(integrationType.toUpperCase())) {
            throw new common_1.BadRequestException(`Invalid integration type. Must be one of: ${validIntegrations.join(', ')}`);
        }
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
    async listTenants(req) {
        if (req.user?.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can list all tenants');
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
            features: tenant.settings?.features || DEFAULT_TENANT_FEATURES,
        }));
    }
    async getTenantBySlug(slug) {
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
            throw new common_1.NotFoundException(`Tenant with slug '${slug}' not found`);
        }
        const settings = tenant.settings;
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
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)('features'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getMyFeatures", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getMyConfig", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Post)('request-integration'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "requestIntegration", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "listTenants", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getTenantBySlug", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)('api/v1/tenants'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [tenant_config_service_1.TenantConfigService,
        prisma_service_1.PrismaService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map