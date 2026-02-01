import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_AUTH_CLIENT } from '../auth/auth.module';
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

@Injectable()
export class AttachmentsService {
  private readonly bucketName = 'attachments';

  constructor(
    @Inject(SUPABASE_AUTH_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async upload(
    file: MulterFile,
    dto: UploadAttachmentDto,
  ): Promise<Attachment> {
    // Validate that either entity_id or transaction_id is provided
    if (!dto.entity_id && !dto.transaction_id) {
      throw new BadRequestException(
        'Either entity_id or transaction_id must be provided',
      );
    }

    // Determine file type
    const fileType = this.determineFileType(file.mimetype);

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname}`;
    const filePath = dto.transaction_id
      ? `transactions/${dto.transaction_id}/${uniqueFilename}`
      : `entities/${dto.entity_id}/${uniqueFilename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new BadRequestException(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    // Save metadata to database
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
      // Try to clean up the uploaded file
      await this.supabase.storage.from(this.bucketName).remove([filePath]);
      throw new BadRequestException(`Database error: ${error.message}`);
    }

    return data;
  }

  async findByTransactionId(transactionId: string): Promise<Attachment[]> {
    const { data, error } = await this.supabase
      .from('attachments')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async findByEntityId(entityId: string): Promise<Attachment[]> {
    const { data, error } = await this.supabase
      .from('attachments')
      .select('*')
      .eq('entity_id', entityId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async delete(id: string): Promise<void> {
    // Get attachment info first
    const { data: attachment, error: fetchError } = await this.supabase
      .from('attachments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !attachment) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }

    // Extract file path from URL
    const fileUrl = new URL(attachment.file_url);
    const pathMatch = fileUrl.pathname.match(/\/attachments\/(.*)/);
    if (pathMatch) {
      const filePath = pathMatch[1];
      // Delete from storage
      await this.supabase.storage.from(this.bucketName).remove([filePath]);
    }

    // Delete from database
    const { error } = await this.supabase
      .from('attachments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  private determineFileType(
    mimetype: string,
  ): 'IMAGE' | 'PDF' | 'AUDIO' | 'OTHER' {
    if (mimetype.startsWith('image/')) return 'IMAGE';
    if (mimetype === 'application/pdf') return 'PDF';
    if (mimetype.startsWith('audio/')) return 'AUDIO';
    return 'OTHER';
  }
}
