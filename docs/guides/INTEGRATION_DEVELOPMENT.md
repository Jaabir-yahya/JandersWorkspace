# Project Bridge - Integration Development Guide

**For the solo developer building integrations**

This guide covers the patterns and practices for developing new integrations in Project Bridge. Since you're the sole developer, consistency and maintainability are key.

---

## Integration Architecture

### Pattern Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Tenant Request                          │
│              (e.g., initiate M-Pesa payment)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Integration Service                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ 1. Check     │  │ 2. Call      │  │ 3. Store         │  │
│  │    Feature   │  │    External  │  │    Result        │  │
│  │    Flag      │  │    API       │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Provider                           │
│              (M-Pesa, WhatsApp, QuickBooks, etc)           │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `apps/api/src/integrations/tenant-config.service.ts` | Fetch tenant integration settings |
| `apps/api/src/integrations/types/integration.types.ts` | Integration type definitions |
| `apps/api/prisma/schema.prisma` | TenantIntegration model |

---

## Creating a New Integration

### Step 1: Define the Integration Types

Add to `apps/api/src/integrations/types/integration.types.ts`:

```typescript
// New integration type
export interface YourIntegrationConfig {
  enabled: boolean;
  apiKey: string;
  apiSecret?: string;
  sandboxMode?: boolean;
  // Provider-specific fields
}

// Extend the union type
export type IntegrationConfig = 
  | MpesaConfig 
  | WhatsAppConfig 
  | QuickBooksConfig
  | YourIntegrationConfig;  // Add here
```

### Step 2: Create the Service

Create `apps/api/src/integrations/[your-integration]/[your-integration].service.ts`:

```typescript
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { TenantConfigService } from '../tenant-config.service';

@Injectable()
export class YourIntegrationService {
  private readonly logger = new Logger(YourIntegrationService.name);

  constructor(private readonly tenantConfig: TenantConfigService) {}

  async performAction(tenantId: string, data: any) {
    // 1. Check feature flag
    const features = await this.tenantConfig.getTenantFeatures(tenantId);
    if (!features.your_integration) {
      throw new ForbiddenException('Your integration not enabled for this tenant');
    }

    // 2. Get integration config
    const config = await this.tenantConfig.getIntegrationConfig(tenantId, 'YOUR_INTEGRATION');
    if (!config || !config.enabled) {
      throw new ForbiddenException('Your integration not configured');
    }

    // 3. Call external API
    try {
      const result = await this.callExternalApi(config, data);
      
      // 4. Log/Store result
      this.logger.log(`Your integration action completed for tenant ${tenantId}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Your integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async callExternalApi(config: any, data: any) {
    // Implementation here
  }
}
```

### Step 3: Create the Controller

Create `apps/api/src/integrations/[your-integration]/[your-integration].controller.ts`:

```typescript
import { Controller, Post, Body, Headers } from '@nestjs/common';
import { YourIntegrationService } from './[your-integration].service';

@Controller('integrations/your-integration')
export class YourIntegrationController {
  constructor(private readonly service: YourIntegrationService) {}

  @Post('action')
  async performAction(
    @Body() dto: YourActionDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.service.performAction(tenantId, dto);
  }
}
```

### Step 4: Create the Module

Create `apps/api/src/integrations/[your-integration]/[your-integration].module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { YourIntegrationController } from './[your-integration].controller';
import { YourIntegrationService } from './[your-integration].service';

@Module({
  controllers: [YourIntegrationController],
  providers: [YourIntegrationService],
})
export class YourIntegrationModule {}
```

### Step 5: Register in Main Integrations Module

Update `apps/api/src/integrations/integrations.module.ts`:

```typescript
import { YourIntegrationModule } from './[your-integration]/[your-integration].module';

@Module({
  imports: [
    // ... existing modules
    YourIntegrationModule,  // Add here
  ],
})
export class IntegrationsModule {}
```

### Step 6: Add Feature Flag to Database

Update `apps/api/prisma/seed.ts`:

```typescript
// Add to featureFlags array
{
  name: 'your_integration',
  description: 'Your integration feature',
  defaultEnabled: false,
},
```

Then run:
```bash
cd apps/api && npx prisma db seed
```

---

## Integration Best Practices

### 1. Always Check Feature Flags

```typescript
const features = await this.tenantConfig.getTenantFeatures(tenantId);
if (!features.your_integration) {
  throw new ForbiddenException('Integration not enabled');
}
```

### 2. Store Sensitive Data Securely

```typescript
// Use encryption for API keys
private encryptApiKey(key: string): string {
  // Implementation using ENCRYPTION_KEY from env
}
```

### 3. Handle Webhooks Properly

```typescript
@Post('webhook')
async handleWebhook(
  @Body() payload: any,
  @Headers('x-signature') signature: string,
) {
  // 1. Verify webhook signature
  if (!this.verifySignature(payload, signature)) {
    throw new UnauthorizedException('Invalid signature');
  }
  
  // 2. Process webhook
  await this.processWebhook(payload);
  
  // 3. Return 200 quickly
  return { received: true };
}
```

### 4. Use Retry Logic

```typescript
import { retry } from 'rxjs/operators';

async callWithRetry(operation: () => Promise<any>) {
  return lastValueFrom(
    from(operation()).pipe(
      retry({ count: 3, delay: 1000 }),
    ),
  );
}
```

### 5. Log Everything

```typescript
this.logger.log(`Integration action: ${action}, tenant: ${tenantId}`);
this.logger.debug(`Request: ${JSON.stringify(request)}`);
this.logger.error(`Failed: ${error.message}`, error.stack);
```

---

## Testing Integrations

### Local Testing

1. **Use sandbox credentials** in development
2. **Create a test tenant** in your local database
3. **Enable the feature flag** for that tenant

```bash
# Enable feature for test tenant
cd apps/api
npx prisma studio
# Manually update tenant_features table
```

### Unit Testing

```typescript
// your-integration.service.spec.ts
describe('YourIntegrationService', () => {
  it('should throw if feature not enabled', async () => {
    jest.spyOn(tenantConfig, 'getTenantFeatures').mockResolvedValue({
      your_integration: false,
    });
    
    await expect(service.performAction('tenant-1', {}))
      .rejects.toThrow(ForbiddenException);
  });
});
```

---

## Common Integration Patterns

### Payment Integration (like M-Pesa)

```typescript
async initiatePayment(tenantId: string, amount: number, phone: string) {
  // 1. Validate
  // 2. Call provider API
  // 3. Create pending transaction
  // 4. Return transaction ID
  // 5. Handle webhook callback
}
```

### Messaging Integration (like WhatsApp)

```typescript
async sendMessage(tenantId: string, to: string, message: string) {
  // 1. Validate phone number
  // 2. Call provider API
  // 3. Log message
  // 4. Handle delivery status webhook
}
```

### Accounting Integration (like QuickBooks)

```typescript
async syncTransaction(tenantId: string, transactionId: string) {
  // 1. Get transaction data
  // 2. Transform to provider format
  // 3. Send to provider
  // 4. Store sync record
}
```

---

## Environment Variables

Add to `apps/api/.env.example`:

```bash
# Your Integration
YOUR_INTEGRATION_API_KEY=...
YOUR_INTEGRATION_API_SECRET=...
YOUR_INTEGRATION_SANDBOX_URL=https://sandbox.provider.com
YOUR_INTEGRATION_PRODUCTION_URL=https://api.provider.com
```

---

## Troubleshooting

### Integration Not Showing

1. Check feature flag is enabled for tenant
2. Check integration config exists in database
3. Verify module is registered in IntegrationsModule

### API Calls Failing

1. Check environment variables are set
2. Verify API credentials are valid
3. Check provider's status page
4. Review logs for error details

### Webhooks Not Received

1. Verify webhook URL is publicly accessible
2. Check firewall/network settings
3. Verify webhook signature validation
4. Use ngrok for local testing:
   ```bash
   ngrok http 3000
   ```

---

## Resources

- [M-Pesa Integration](apps/api/src/integrations/kenya/mpesa/mpesa.service.ts) - Reference implementation
- [WhatsApp Integration](apps/api/src/integrations/whatsapp/whatsapp.service.ts) - Webhook handling
- [QuickBooks Integration](apps/api/src/integrations/quickbooks/quickbooks.service.ts) - OAuth flow

---

**Remember: Keep it simple. You're the only developer.**
