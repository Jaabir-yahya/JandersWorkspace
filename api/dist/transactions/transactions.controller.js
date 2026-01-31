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
exports.EntitiesController = exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const post_transaction_dto_1 = require("./dto/post-transaction.dto");
const reverse_transaction_dto_1 = require("./dto/reverse-transaction.dto");
const update_payment_status_dto_1 = require("./dto/update-payment-status.dto");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    create(dto) {
        return this.transactionsService.create(dto);
    }
    findAll(tenantId, status, type, entityId, dateFrom, dateTo, search, paymentStatus) {
        if (search) {
            return this.transactionsService.searchTransactions(tenantId, search, {
                status,
                type,
                entity_id: entityId,
                date_from: dateFrom,
                date_to: dateTo,
                payment_status: paymentStatus,
            });
        }
        return this.transactionsService.findAll(tenantId, {
            status,
            type,
            entity_id: entityId,
            date_from: dateFrom,
            date_to: dateTo,
            payment_status: paymentStatus,
        });
    }
    findOne(id) {
        return this.transactionsService.findOne(id);
    }
    findByEntity(entityId) {
        return this.transactionsService.findByEntity(entityId);
    }
    postTransaction(id, dto) {
        return this.transactionsService.postTransaction(id, dto);
    }
    reverseTransaction(id, dto) {
        return this.transactionsService.reverseTransaction(id, dto);
    }
    updatePaymentStatus(id, dto) {
        return this.transactionsService.updatePaymentStatus(id, dto);
    }
    async exportTransaction(id) {
        return this.transactionsService.standardizeTransaction(id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('entity_id')),
    __param(4, (0, common_1.Query)('date_from')),
    __param(5, (0, common_1.Query)('date_to')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('payment_status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('entity/:entityId'),
    __param(0, (0, common_1.Param)('entityId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Post)(':id/post'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, post_transaction_dto_1.PostTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "postTransaction", null);
__decorate([
    (0, common_1.Post)(':id/reverse'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reverse_transaction_dto_1.ReverseTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "reverseTransaction", null);
__decorate([
    (0, common_1.Patch)(':id/payment_status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_status_dto_1.UpdatePaymentStatusDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "exportTransaction", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
let EntitiesController = class EntitiesController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    findAll(tenantId, type, search) {
        if (!tenantId) {
            throw new Error('tenant_id is required');
        }
        return this.transactionsService.findAllEntities(tenantId, { type, search });
    }
    create(dto) {
        return this.transactionsService.createEntity(dto);
    }
    findOne(id) {
        return this.transactionsService.findEntityById(id);
    }
    getEntityHistory(id, tenantId) {
        if (!tenantId) {
            throw new Error('tenant_id is required');
        }
        return this.transactionsService.getEntityHistory(id, tenantId);
    }
    getEntityBalance(id, tenantId) {
        if (!tenantId) {
            throw new Error('tenant_id is required');
        }
        return this.transactionsService.getEntityBalance(id, tenantId);
    }
    getEntity360View(id, tenantId) {
        if (!tenantId) {
            throw new Error('tenant_id is required');
        }
        return this.transactionsService.getEntity360View(id, tenantId);
    }
    searchByPhone(phone, tenantId) {
        if (!tenantId) {
            throw new Error('tenant_id is required');
        }
        if (!phone) {
            throw new Error('phone query parameter is required');
        }
        return this.transactionsService.searchEntitiesByPhone(phone, tenantId);
    }
    addLinkedPhone(id, phone) {
        if (!phone) {
            throw new Error('phone is required');
        }
        return this.transactionsService.addLinkedPhone(id, phone);
    }
    removeLinkedPhone(id, phone) {
        return this.transactionsService.removeLinkedPhone(id, phone);
    }
};
exports.EntitiesController = EntitiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntityHistory", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntityBalance", null);
__decorate([
    (0, common_1.Get)(':id/360-view'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntity360View", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('phone')),
    __param(1, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "searchByPhone", null);
__decorate([
    (0, common_1.Post)(':id/linked-phones'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "addLinkedPhone", null);
__decorate([
    (0, common_1.Delete)(':id/linked-phones/:phone'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "removeLinkedPhone", null);
exports.EntitiesController = EntitiesController = __decorate([
    (0, common_1.Controller)('entities'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], EntitiesController);
//# sourceMappingURL=transactions.controller.js.map