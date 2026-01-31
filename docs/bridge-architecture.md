# Bridge Architecture Design

## 1. Overall Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TENANT UI LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Basic UI (80%)    │    Advanced UI (20%)    │    Admin Portal              │
│  - Digital Notes   │    - Full Integrations │    - Tenant Management       │
│  - Simple Dashboard│    - M-Pesa Dashboard  │    - Analytics               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Feature Flag Service  │  Tenant Tier Router  │  Rate Limiting              │
│  - Basic Features      │  - Basic Endpoints   │  - Per Tenant               │
│  - Advanced Features   │  - Advanced Endpoints │  - Per Country              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Services       │  Integration Services │  Analytics Services          │
│  - Transactions      │  - M-Pesa Service     │  - Dashboard                 │
│  - Entities          │  - WhatsApp Service   │  - Reports                   │
│  - Users             │  - QuickBooks Stub    │  - Revenue Tracking           │
│  - Attachments       │  - Xero Stub          │  - Commission Tracking        │
│                      │  - Shopify Stub       │                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA TRANSFORMATION LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Universal Mapper     │  Event Processor     │  Webhook Manager             │
│  - Local ↔ Kenya      │  - Transaction Events│  - Outbound Webhooks         │
│  - Kenya ↔ International│  - Payment Events   │  - Inbound Webhooks          │
│  - Currency Conversion │  - Entity Events     │  - Retry Logic               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PERSISTENCE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Truth)    │  Supabase Storage    │  Redis Cache                 │
│  - Transaction Ledger  │  - Attachments      │  - Session Data              │
│  - Entity 360° Views   │  - Documents        │  - Rate Limits               │
│  - Tenant Data         │  - Media            │  - Feature Flags              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Tenant Tier System Design

### Tenant Configuration Schema

```sql
CREATE TYPE tenant_tier AS ENUM ('BASIC', 'ADVANCED');
CREATE TYPE tenant_country AS ENUM ('KE', 'TZ', 'UG', 'RW', 'NG');

CREATE TABLE tenant_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  tier tenant_tier NOT NULL DEFAULT 'BASIC',
  country tenant_country NOT NULL DEFAULT 'KE',
  features jsonb DEFAULT '{}', -- Feature flags per tenant
  integration_settings jsonb DEFAULT '{}', -- API keys, webhooks
  commission_rates jsonb DEFAULT '{}', -- Revenue sharing rates
  compliance_data jsonb DEFAULT '{}', -- Country-specific compliance
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Feature Differentiation Matrix

| Feature                        | Basic (80%) | Advanced (20%) |
| ------------------------------ | ----------- | -------------- |
| **Core Features**              |
| Digital Notetaking             | ✅          | ✅             |
| Transaction Ledger             | ✅          | ✅             |
| Entity Management              | ✅          | ✅             |
| Basic Dashboard                | ✅          | ✅             |
| Attachments                    | ✅          | ✅             |
| **Kenyan Integrations**        |
| M-Pesa STK Push                | ❌          | ✅             |
| M-Pesa C2B                     | ❌          | ✅             |
| M-Pesa B2C                     | ❌          | ✅             |
| WhatsApp Business              | ❌          | ✅             |
| Revenue Sharing                | ❌          | ✅             |
| **International Integrations** |
| QuickBooks Online              | ❌          | ✅             |
| Xero Accounting                | ❌          | ✅             |
| Shopify E-commerce             | ❌          | ✅             |
| Multi-currency                 | Basic       | Advanced       |
| **Advanced Features**          |
| Custom Reports                 | ❌          | ✅             |
| API Access                     | Read-only   | Full           |
| Webhooks                       | ❌          | ✅             |
| Advanced Analytics             | ❌          | ✅             |
| White-labeling                 | ❌          | ✅             |

## 3. Integration Service Layer Architecture

### Service Structure

```
src/integrations/
├── kenya/
│   ├── mpesa/
│   │   ├── daraja.service.ts
│   │   ├── stk-push.service.ts
│   │   ├── c2b.service.ts
│   │   ├── b2c.service.ts
│   │   └── b2b.service.ts
│   └── whatsapp/
│       ├── whatsapp.service.ts
│       ├── message-templates.service.ts
│       └── webhook-handler.service.ts
├── international/
│   ├── quickbooks/
│   │   ├── quickbooks.service.ts
│   │   ├── auth.service.ts
│   │   └── data-sync.service.ts
│   ├── xero/
│   │   ├── xero.service.ts
│   │   ├── auth.service.ts
│   │   └── data-sync.service.ts
│   └── shopify/
│       ├── shopify.service.ts
│       ├── orders.service.ts
│       └── products.service.ts
├── common/
│   ├── base-integration.service.ts
│   ├── webhook-manager.service.ts
│   ├── rate-limiter.service.ts
│   └── retry-handler.service.ts
└── types/
    ├── integration.types.ts
    ├── webhook.types.ts
    └── event.types.ts
```

### Integration Interface

```typescript
interface IIntegrationService {
  name: string;
  country: string;
  tier: TenantTier;
  authenticate(config: IntegrationConfig): Promise<AuthResult>;
  syncData(data: SyncRequest): Promise<SyncResult>;
  handleWebhook(payload: WebhookPayload): Promise<WebhookResult>;
  getHealth(): Promise<HealthStatus>;
}
```

## 4. Data Transformation Layer

### Universal Mapper Design

```typescript
interface DataMapper {
  // Local → Kenya systems
  toMpesaTransaction(txn: Transaction): MpesaTransactionRequest;
  toWhatsAppMessage(data: NotificationData): WhatsAppMessage;

  // Kenya → International systems
  toQuickBooksInvoice(txn: Transaction, entity: Entity): QuickBooksInvoice;
  toXeroInvoice(txn: Transaction, entity: Entity): XeroInvoice;
  toShopifyOrder(txn: Transaction): ShopifyOrder;

  // International → Local systems
  fromQuickBooksInvoice(invoice: QuickBooksInvoice): Transaction;
  fromXeroInvoice(invoice: XeroInvoice): Transaction;
  fromShopifyOrder(order: ShopifyOrder): Transaction;

  // Currency conversion
  convertCurrency(amount: number, from: string, to: string): Promise<number>;
  mapAccountCode(localCode: string, system: string): string;
}
```

### Event System Design

```typescript
interface IntegrationEvent {
  id: string;
  tenantId: string;
  type: EventType;
  source: EventSource;
  target: EventTarget;
  data: any;
  timestamp: Date;
  retryCount: number;
  status: EventStatus;
}

enum EventType {
  TRANSACTION_CREATED = "transaction.created",
  TRANSACTION_UPDATED = "transaction.updated",
  PAYMENT_RECEIVED = "payment.received",
  ENTITY_UPDATED = "entity.updated",
  SYNC_COMPLETED = "sync.completed",
  SYNC_FAILED = "sync.failed",
}
```

## 5. API Endpoint Structure

### Basic Tenant Endpoints (port 3000)

```typescript
// Core business functions
GET    /api/v1/transactions          // List transactions
POST   /api/v1/transactions          // Create transaction
GET    /api/v1/transactions/:id      // Get transaction
PUT    /api/v1/transactions/:id      // Update transaction (draft only)
POST   /api/v1/transactions/:id/post // Post transaction

GET    /api/v1/entities              // List entities
POST   /api/v1/entities              // Create entity
GET    /api/v1/entities/:id          // Get entity details (360° view)

GET    /api/v1/dashboard              // Basic dashboard
GET    /api/v1/reports               // Basic reports

POST   /api/v1/attachments           // Upload attachments
GET    /api/v1/attachments/:id       // Download attachment
```

### Advanced Tenant Endpoints (port 3000 with feature flags)

```typescript
// M-Pesa integrations
POST / api / v1 / mpesa / stk - push; // Initiate STK push
POST / api / v1 / mpesa / c2b; // Register C2B URLs
GET / api / v1 / mpesa / c2b / transactions; // Get C2B transactions
POST / api / v1 / mpesa / b2c; // Send B2C payment
POST / api / v1 / mpesa / b2b; // Send B2B payment

// WhatsApp integrations
POST / api / v1 / whatsapp / messages; // Send message
GET / api / v1 / whatsapp / templates; // Get message templates
POST / api / v1 / whatsapp / webhook; // Receive webhook

// International integrations
POST / api / v1 / quickbooks / sync; // Sync to QuickBooks
POST / api / v1 / xero / sync; // Sync to Xero
POST / api / v1 / shopify / sync; // Sync to Shopify

// Advanced features
GET / api / v1 / analytics; // Advanced analytics
POST / api / v1 / webhooks; // Configure webhooks
GET / api / v1 / api - keys; // Manage API keys
```

## 6. Event and Webhook System

### Event Bus Architecture

```typescript
class IntegrationEventBus {
  // Publish events to internal subscribers
  publish(event: IntegrationEvent): Promise<void>;

  // Subscribe to internal events
  subscribe(pattern: string, handler: EventHandler): void;

  // Process outbound webhooks
  processWebhook(event: IntegrationEvent): Promise<WebhookResult>;

  // Handle inbound webhooks
  handleInboundWebhook(source: string, payload: any): Promise<void>;
}
```

### Webhook Management

```typescript
interface WebhookConfig {
  id: string;
  tenantId: string;
  url: string;
  events: EventType[];
  secret: string;
  isActive: boolean;
  retryPolicy: RetryPolicy;
}

class WebhookManager {
  register(config: WebhookConfig): Promise<void>;
  unregister(id: string): Promise<void>;
  trigger(event: IntegrationEvent): Promise<void>;
  retry(webhookId: string): Promise<void>;
}
```

## 7. Security and Compliance Framework

### Security Layers

1. **Authentication**: JWT-based auth with tenant isolation
2. **Authorization**: Role-based access control (RBAC)
3. **API Security**: Rate limiting, request signing, IP whitelisting
4. **Data Encryption**: Encryption at rest and in transit
5. **Audit Logging**: Comprehensive audit trail

### Kenyan Compliance

```typescript
interface KenyaCompliance {
  // Central Bank of Kenya requirements
  cbkReporting: boolean;
  transactionLimits: {
    daily: number;
    monthly: number;
    perTransaction: number;
  };

  // Data protection (GDPR-like)
  dataRetention: {
    years: number;
    anonymization: boolean;
  };

  // Mobile money regulations
  mpesaCompliance: {
    kycRequired: boolean;
    amlChecks: boolean;
    reportingThreshold: number;
  };
}
```

## 8. Database Design Adjustments

### Integration Tables

```sql
-- Integration configurations
CREATE TABLE integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  integration_type text NOT NULL, -- 'mpesa', 'whatsapp', 'quickbooks', etc.
  config jsonb NOT NULL, -- API keys, endpoints, settings
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- External system references
CREATE TABLE external_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  local_id uuid NOT NULL, -- Transaction, Entity, etc.
  local_type text NOT NULL, -- 'transaction', 'entity', etc.
  external_system text NOT NULL, -- 'mpesa', 'quickbooks', etc.
  external_id text NOT NULL,
  external_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, local_type, local_id, external_system)
);

-- Webhook deliveries
CREATE TABLE webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  webhook_config_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  delivered_at timestamptz,
  retry_count integer DEFAULT 0,
  status text DEFAULT 'pending', -- 'pending', 'delivered', 'failed'
  created_at timestamptz DEFAULT now()
);

-- Integration events log
CREATE TABLE integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  event_type text NOT NULL,
  source_system text NOT NULL,
  target_system text,
  event_data jsonb NOT NULL,
  processed_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

### Performance Indexes

```sql
-- Integration performance
CREATE INDEX idx_integration_configs_tenant_type ON integration_configs(tenant_id, integration_type);
CREATE INDEX idx_external_refs_local ON external_references(local_type, local_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, created_at);
CREATE INDEX idx_integration_events_status ON integration_events(status, created_at);

-- Tenant isolation
CREATE INDEX idx_integration_tenant_isolation ON integration_configs(tenant_id);
CREATE INDEX idx_webhooks_tenant_isolation ON webhook_deliveries(tenant_id);
CREATE INDEX idx_events_tenant_isolation ON integration_events(tenant_id);
```

## 9. Deployment and Scaling Considerations

### Infrastructure Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LOAD BALANCER                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY CLUSTER                                     │
│  (Multiple instances, auto-scaling based on RPS)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVICE CLUSTER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Core Services  │  │ Integration Svc │  │  Analytics Svc  │              │
│  │                 │  │                 │  │                 │              │
│  │ - Transactions  │  │ - M-Pesa       │  │ - Dashboard     │              │
│  │ - Entities      │  │ - WhatsApp     │  │ - Reports       │              │
│  │ - Users         │  │ - QuickBooks   │  │ - Revenue       │              │
│  │ - Attachments   │  │ - Xero         │  │ - Commission    │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   PostgreSQL    │  │  Supabase       │  │     Redis       │              │
│  │   (Primary)     │  │   Storage       │  │     Cache       │              │
│  │   + Read Replicas│ │                 │  │                 │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scaling Strategies

#### Vertical Scaling

- **Database**: Start with 2 vCPUs, 8GB RAM
- **Application**: 1-2 vCPUs, 4GB RAM per instance
- **Redis**: 1 vCPU, 2GB RAM

#### Horizontal Scaling

- **API Gateway**: Auto-scale based on RPS (target: 1000 RPS/instance)
- **Core Services**: Auto-scale based on CPU/memory
- **Integration Services**: Dedicated instances per country/region
- **Workers**: Background job processing scale independently

### Deployment Architecture

```
Development Environment:
- Single instance deployment
- Local databases
- Feature flags for testing

Staging Environment:
- Production-like setup
- Smaller resource allocation
- Full integration testing

Production Environment:
- Multi-AZ deployment
- Database clustering
- CDN for static assets
- Monitoring and alerting
```

### Monitoring and Observability

1. **Application Metrics**: Response times, error rates, throughput
2. **Business Metrics**: Transaction volume, integration success rates
3. **Infrastructure Metrics**: CPU, memory, disk, network
4. **Security Monitoring**: Failed auth attempts, unusual patterns
5. **Integration Health**: M-Pesa API health, webhook delivery rates

This architecture provides a solid foundation for Kenya-first expansion while maintaining the flexibility to scale internationally. The tiered approach ensures cost-effective service delivery while the modular design allows for incremental feature development.
