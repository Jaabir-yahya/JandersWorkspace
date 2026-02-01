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
exports.AttachmentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auth_guard_1 = require("../auth/auth.guard");
const attachments_service_1 = require("./attachments.service");
const upload_attachment_dto_1 = require("./dto/upload-attachment.dto");
let AttachmentsController = class AttachmentsController {
    attachmentsService;
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    findByTransaction(transactionId) {
        return this.attachmentsService.findByTransactionId(transactionId);
    }
    findByEntity(entityId) {
        return this.attachmentsService.findByEntityId(entityId);
    }
    upload(file, dto) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File size exceeds 5MB limit. Received ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }
        const ALLOWED_MIME_TYPES = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type '${file.mimetype}' not allowed. Allowed types: JPEG, PNG, GIF, WebP, PDF`);
        }
        return this.attachmentsService.upload(file, dto);
    }
    delete(id) {
        return this.attachmentsService.delete(id);
    }
};
exports.AttachmentsController = AttachmentsController;
__decorate([
    (0, common_1.Get)('transaction/:transactionId'),
    __param(0, (0, common_1.Param)('transactionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "findByTransaction", null);
__decorate([
    (0, common_1.Get)('entity/:entityId'),
    __param(0, (0, common_1.Param)('entityId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_attachment_dto_1.UploadAttachmentDto]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "delete", null);
exports.AttachmentsController = AttachmentsController = __decorate([
    (0, common_1.Controller)('attachments'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], AttachmentsController);
//# sourceMappingURL=attachments.controller.js.map