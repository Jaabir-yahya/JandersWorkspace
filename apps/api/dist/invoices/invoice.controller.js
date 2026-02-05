"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const InvoiceServiceModule = __importStar(require("./invoice.service"));
let InvoiceController = class InvoiceController {
    invoiceService;
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
    }
    async createInvoice(req, createInvoiceDto) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.invoiceService.createInvoice(user.tenantId, user.id, createInvoiceDto);
    }
    async findAllInvoices(req) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.invoiceService.findAllInvoices(user.tenantId);
    }
    async findOneInvoice(req, id) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.invoiceService.findOneInvoice(user.tenantId, id);
    }
    async applyPayment(req, id, paymentDto) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        paymentDto.invoiceId = id;
        return this.invoiceService.applyPayment(user.tenantId, user.id, paymentDto);
    }
    async cancelInvoice(req, id) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        await this.invoiceService.updateInvoicePaymentStatus(user.tenantId, id, 'CANCELLED');
        return { message: 'Invoice cancelled successfully' };
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Post)(),
    ApiOperation({ summary: 'Create new invoice' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)(),
    ApiOperation({ summary: 'Get all invoices' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "findAllInvoices", null);
__decorate([
    (0, common_1.Get)(':id'),
    ApiOperation({ summary: 'Get invoice by ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "findOneInvoice", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    ApiOperation({ summary: 'Apply payment to invoice' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "applyPayment", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    ApiOperation({ summary: 'Cancel invoice' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "cancelInvoice", null);
exports.InvoiceController = InvoiceController = __decorate([
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [InvoiceServiceModule.InvoiceService])
], InvoiceController);
function ApiOperation(options) {
    return (target, propertyKey, descriptor) => {
    };
}
//# sourceMappingURL=invoice.controller.js.map