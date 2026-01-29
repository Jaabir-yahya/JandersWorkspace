import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ValidationPipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get('transaction/:transactionId')
  findByTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.attachmentsService.findByTransactionId(transactionId);
  }

  @Get('entity/:entityId')
  findByEntity(
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.attachmentsService.findByEntityId(entityId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: MulterFile,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UploadAttachmentDto,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }
    return this.attachmentsService.upload(file, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.delete(id);
  }
}
