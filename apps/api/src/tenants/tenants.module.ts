import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TenantsPublicController } from './tenants-public.controller';

@Module({
  imports: [PrismaModule, IntegrationsModule],
  controllers: [TenantsPublicController, TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
