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
exports.TenantsPublicController = void 0;
const common_1 = require("@nestjs/common");
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
let TenantsPublicController = class TenantsPublicController {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
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
exports.TenantsPublicController = TenantsPublicController;
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsPublicController.prototype, "getTenantBySlug", null);
exports.TenantsPublicController = TenantsPublicController = __decorate([
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsPublicController);
//# sourceMappingURL=tenants-public.controller.js.map