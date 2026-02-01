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
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantsService = TenantsService_1 = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    static hashKey(plainKey) {
        return (0, crypto_1.createHash)('sha256').update(plainKey.trim()).digest('hex');
    }
    async validateTenantKey(tenantId, plainKey) {
        if (!plainKey?.trim())
            return true;
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { apiKeyHash: true },
        });
        if (!tenant?.apiKeyHash)
            return true;
        const hash = TenantsService_1.hashKey(plainKey);
        return hash === tenant.apiKeyHash;
    }
    async assertTenantKeyIfPresent(tenantId, plainKey) {
        const ok = await this.validateTenantKey(tenantId, plainKey);
        if (!ok) {
            throw new common_1.UnauthorizedException('Invalid or missing tenant key');
        }
    }
    async setTenantApiKey(tenantId, plainKey) {
        const hash = TenantsService_1.hashKey(plainKey);
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { apiKeyHash: hash },
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map