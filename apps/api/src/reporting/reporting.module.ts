import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UniversalTruthModule } from '../universal-truth/universal-truth.module';

@Module({
  imports: [PrismaModule, UniversalTruthModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
