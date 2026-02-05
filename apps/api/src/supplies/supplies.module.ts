import { Module } from '@nestjs/common';
import { SuppliesController } from './supplies.controller';
import { SuppliesService } from './supplies.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UniversalTruthModule } from '../universal-truth/universal-truth.module';

@Module({
  imports: [PrismaModule, UniversalTruthModule],
  controllers: [SuppliesController],
  providers: [SuppliesService],
  exports: [SuppliesService],
})
export class SuppliesModule {}
