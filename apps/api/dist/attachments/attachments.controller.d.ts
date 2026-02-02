import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    findByTransaction(transactionId: string): Promise<import("./attachments.service").Attachment[]>;
    findByEntity(entityId: string): Promise<import("./attachments.service").Attachment[]>;
    upload(file: MulterFile, dto: UploadAttachmentDto): Promise<import("./attachments.service").Attachment>;
    delete(id: string): Promise<void>;
}
export {};
