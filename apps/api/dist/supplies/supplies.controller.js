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
exports.SuppliesController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const supplies_service_1 = require("./supplies.service");
let SuppliesController = class SuppliesController {
    suppliesService;
    constructor(suppliesService) {
        this.suppliesService = suppliesService;
    }
    async createSupply(req, createSupplyDto) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.suppliesService.createSupply(user.tenantId, user.id, createSupplyDto);
    }
    async findAllSupplies(req) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.suppliesService.findAllSupplies(user.tenantId);
    }
    async findOneSupply(req, id) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.suppliesService.findOneSupply(user.tenantId, id);
    }
    async updateSupplyStatus(req, id, status) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.suppliesService.updateSupplyStatus(user.tenantId, id, status);
    }
    async deleteSupply(req, id) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        await this.suppliesService.deleteSupply(user.tenantId, id);
        return { message: 'Supply deleted successfully' };
    }
};
exports.SuppliesController = SuppliesController;
__decorate([
    (0, common_1.Post)(),
    ApiOperation({ summary: 'Create new supply' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SuppliesController.prototype, "createSupply", null);
__decorate([
    (0, common_1.Get)(),
    ApiOperation({ summary: 'Get all supplies' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuppliesController.prototype, "findAllSupplies", null);
__decorate([
    (0, common_1.Get)(':id'),
    ApiOperation({ summary: 'Get supply by ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SuppliesController.prototype, "findOneSupply", null);
__decorate([
    (0, common_1.Patch)(':id'),
    ApiOperation({ summary: 'Update supply status' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SuppliesController.prototype, "updateSupplyStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    ApiOperation({ summary: 'Delete supply' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SuppliesController.prototype, "deleteSupply", null);
exports.SuppliesController = SuppliesController = __decorate([
    (0, common_1.Controller)('supplies'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [supplies_service_1.SuppliesService])
], SuppliesController);
function ApiOperation(options) {
    return (target, propertyKey, descriptor) => {
    };
}
//# sourceMappingURL=supplies.controller.js.map