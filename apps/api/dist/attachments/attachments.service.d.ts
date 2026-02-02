import { ConfigService } from '@nestjs/config';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export interface Attachment {
    id: string;
    entity_id?: string;
    transaction_id?: string;
    file_name: string;
    file_type: 'IMAGE' | 'PDF' | 'AUDIO' | 'OTHER';
    file_url: string;
    file_size?: number;
    uploaded_by_user_id: string;
    uploaded_at: string;
    metadata: Record<string, unknown>;
}
export declare class AttachmentsService {
    private readonly configService;
    private readonly bucketName;
    private readonly supabase;
    constructor(configService: ConfigService);
    upload(file: MulterFile, dto: UploadAttachmentDto): Promise<Attachment>;
    findByTransactionId(transactionId: string): Promise<Attachment[]>;
    findByEntityId(entityId: string): Promise<Attachment[]>;
    delete(id: string): Promise<void>;
    private determineFileType;
}
export {};
