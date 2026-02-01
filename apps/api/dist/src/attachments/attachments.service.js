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
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const auth_module_1 = require("../auth/auth.module");
let AttachmentsService = class AttachmentsService {
    supabase;
    bucketName = 'attachments';
    constructor(supabase) {
        this.supabase = supabase;
    }
    async upload(file, dto) {
        if (!dto.entity_id && !dto.transaction_id) {
            throw new common_1.BadRequestException('Either entity_id or transaction_id must be provided');
        }
        const fileType = this.determineFileType(file.mimetype);
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${file.originalname}`;
        const filePath = dto.transaction_id
            ? `transactions/${dto.transaction_id}/${uniqueFilename}`
            : `entities/${dto.entity_id}/${uniqueFilename}`;
        const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from(this.bucketName)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (uploadError) {
            throw new common_1.BadRequestException(`Upload failed: ${uploadError.message}`);
        }
        const { data: urlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);
        const { data, error } = await this.supabase
            .from('attachments')
            .insert({
            entity_id: dto.entity_id || null,
            transaction_id: dto.transaction_id || null,
            file_name: file.originalname,
            file_type: fileType,
            file_url: urlData.publicUrl,
            file_size: file.size,
            uploaded_by_user_id: dto.uploaded_by_user_id,
            metadata: {},
        })
            .select()
            .single();
        if (error) {
            await this.supabase.storage.from(this.bucketName).remove([filePath]);
            throw new common_1.BadRequestException(`Database error: ${error.message}`);
        }
        return data;
    }
    async findByTransactionId(transactionId) {
        const { data, error } = await this.supabase
            .from('attachments')
            .select('*')
            .eq('transaction_id', transactionId)
            .order('uploaded_at', { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data || [];
    }
    async findByEntityId(entityId) {
        const { data, error } = await this.supabase
            .from('attachments')
            .select('*')
            .eq('entity_id', entityId)
            .order('uploaded_at', { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data || [];
    }
    async delete(id) {
        const { data: attachment, error: fetchError } = await this.supabase
            .from('attachments')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !attachment) {
            throw new common_1.NotFoundException(`Attachment ${id} not found`);
        }
        const fileUrl = new URL(attachment.file_url);
        const pathMatch = fileUrl.pathname.match(/\/attachments\/(.*)/);
        if (pathMatch) {
            const filePath = pathMatch[1];
            await this.supabase.storage.from(this.bucketName).remove([filePath]);
        }
        const { error } = await this.supabase
            .from('attachments')
            .delete()
            .eq('id', id);
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    determineFileType(mimetype) {
        if (mimetype.startsWith('image/'))
            return 'IMAGE';
        if (mimetype === 'application/pdf')
            return 'PDF';
        if (mimetype.startsWith('audio/'))
            return 'AUDIO';
        return 'OTHER';
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_module_1.SUPABASE_AUTH_CLIENT)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map