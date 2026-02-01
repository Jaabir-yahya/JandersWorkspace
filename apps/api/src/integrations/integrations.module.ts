import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MpesaService } from './kenya/mpesa/mpesa.service';
import { TenantConfigService } from './tenant-config.service';
import { IntegrationsController } from './integrations.controller';
// Temporarily disable non-working integrations until Phase 4
// import { WhatsAppModule } from './whatsapp/whatsapp.module';
// import { QuickBooksModule } from './quickbooks/quickbooks.module';
// import { XeroModule } from './xero/xero.module';
// import { ShopifyModule } from './shopify/shopify.module';

@Module({
  imports: [
    ConfigModule,
    // WhatsAppModule,  // TODO: Enable when implemented in Phase 4
    // QuickBooksModule, // TODO: Enable when implemented in Phase 4
    // XeroModule,      // TODO: Enable when implemented in Phase 4
    // ShopifyModule,   // TODO: Enable when implemented in Phase 4
  ],
  controllers: [IntegrationsController],
  providers: [TenantConfigService, MpesaService],
  exports: [TenantConfigService, MpesaService],
})
export class IntegrationsModule {}
