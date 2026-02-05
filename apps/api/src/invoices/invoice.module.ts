import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UniversalTruthModule } from '../universal-truth/universal-truth.module';

@Module({
  imports: [PrismaModule, UniversalTruthModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
