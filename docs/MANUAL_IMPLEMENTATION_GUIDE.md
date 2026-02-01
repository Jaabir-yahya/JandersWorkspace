# Manual-First Implementation Guide

## Quick Start for Manual Tenants

This guide provides the implementation steps for delivering Project Bridge's manual-first approach to 80% of African informal economy businesses.

## Implementation Checklist

### ✅ Step 1: Backend Services (Week 1-2)

#### Create Manual Service Module

```bash
# Create new service files
mkdir -p apps/api/src/manual
touch apps/api/src/manual/manual.service.ts
touch apps/api/src/manual/manual.controller.ts
touch apps/api/src/manual/manual.module.ts
touch apps/api/src/manual/dto/quick-capture.dto.ts
```

#### Manual Service Implementation

```typescript
// apps/api/src/manual/manual.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ManualService {
  constructor(private readonly prisma: PrismaService) {}

  async quickCapture(tenantId: string, data: QuickCaptureDto) {
    // Handle voice/photo/manual transaction capture
    // Auto-categorize based on history
    // Create transaction with minimal friction
  }

  async transcribeAudio(audioFile: Express.Multer.File) {
    // Integrate with speech-to-text API
    // Support multiple languages (English, Swahili, Sheng)
    // Return structured transaction data
  }

  async scanReceipt(imageFile: Express.Multer.File) {
    // OCR and image processing
    // Extract merchant, amount, items, date
    // Return structured receipt data
  }

  async getManualDashboardStats(tenantId: string) {
    // Simplified metrics for manual tenants
    // Today's money in/out, profit, top customer
    // Low stock alerts, recent activity
  }

  async sendSMSSummary(tenantId: string) {
    // Generate daily/weekly business summary
    // Send via SMS provider
    // Include key insights and reminders
  }
}
```

#### API Endpoints

```typescript
// apps/api/src/manual/manual.controller.ts
@Controller("api/v1/manual")
@UseGuards(AuthGuard)
export class ManualController {
  @Post("quick-capture")
  async quickCapture(
    @Body() dto: QuickCaptureDto,
    @Headers("x-tenant-id") tenantId: string,
  ) {
    return this.manualService.quickCapture(tenantId, dto);
  }

  @Post("transcribe")
  @UseInterceptors(FileInterceptor("audio"))
  async transcribeAudio(@UploadedFile() file: Express.Multer.File) {
    return this.manualService.transcribeAudio(file);
  }

  @Post("scan-receipt")
  @UseInterceptors(FileInterceptor("image"))
  async scanReceipt(@UploadedFile() file: Express.Multer.File) {
    return this.manualService.scanReceipt(file);
  }

  @Get("dashboard-stats")
  async getDashboardStats(@Headers("x-tenant-id") tenantId: string) {
    return this.manualService.getManualDashboardStats(tenantId);
  }

  @Post("send-sms-summary")
  async sendSMSSummary(@Headers("x-tenant-id") tenantId: string) {
    return this.manualService.sendSMSSummary(tenantId);
  }
}
```

### ✅ Step 2: Frontend Components (Week 2-3)

#### Create Manual UI Components

```bash
# Create manual component directories
mkdir -p web/my-app/components/manual
mkdir -p web/my-app/app/(manual)

# Create component files
touch web/my-app/components/manual/VoiceNoteRecorder.tsx
touch web/my-app/components/manual/PhotoReceiptScanner.tsx
touch web/my-app/components/manual/QuickTransactionForm.tsx
touch web/my-app/components/manual/ManualDashboard.tsx
touch web/my-app/components/manual/QuickCaptureButton.tsx
```

#### Manual Layout Structure

```typescript
// web/my-app/app/(manual)/layout.tsx
export default function ManualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="manual-layout">
      <ManualNavigation />
      <main className="pb-20"> {/* Space for bottom nav */}
        {children}
      </main>
    </div>
  );
}
```

#### Quick Capture Implementation

```typescript
// web/my-app/app/(manual)/quick-capture/page.tsx
"use client";

import { useState } from 'react';
import { VoiceNoteRecorder } from '@/components/manual/VoiceNoteRecorder';
import { PhotoReceiptScanner } from '@/components/manual/PhotoReceiptScanner';
import { QuickTransactionForm } from '@/components/manual/QuickTransactionForm';

export default function QuickCapturePage() {
  const [mode, setMode] = useState<'voice' | 'photo' | 'manual'>('manual');

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector with large touch targets */}
      <div className="flex justify-around p-4 bg-secondary">
        {['voice', 'photo', 'manual'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as any)}
            className={`p-4 rounded-xl text-lg font-medium transition-all ${
              mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            {m === 'voice' ? '🎤 Voice' : m === 'photo' ? '📷 Photo' : '✏️ Manual'}
          </button>
        ))}
      </div>

      {/* Capture interface */}
      <div className="flex-1 p-4">
        {mode === 'voice' && <VoiceNoteRecorder />}
        {mode === 'photo' && <PhotoReceiptScanner />}
        {mode === 'manual' && <QuickTransactionForm />}
      </div>
    </div>
  );
}
```

### ✅ Step 3: Tenant Type Detection (Week 3)

#### Tenant Detection Hook

```typescript
// web/my-app/lib/hooks/use-tenant-type.ts
export function useTenantType() {
  const { data: user } = useUser();

  return {
    isManual: user?.tenant?.tier === "BASIC",
    isAdvanced: ["ADVANCED", "PREMIUM", "ENTERPRISE"].includes(
      user?.tenant?.tier,
    ),
    tier: user?.tenant?.tier || "BASIC",
    features: user?.tenant?.features || [],
  };
}
```

#### Route Protection

```typescript
// web/my-app/components/layout/RouteGuard.tsx
export function RouteGuard({ children, requiredTier }: {
  children: React.ReactNode;
  requiredTier?: string;
}) {
  const { tier } = useTenantType();

  if (requiredTier && tier !== requiredTier) {
    return <UpgradePrompt />;
  }

  return <>{children}</>;
}
```

### ✅ Step 4: PWA Configuration (Week 3-4)

#### Update Next.js Config

```javascript
// web/my-app/next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Your existing config
});
```

#### Service Worker Setup

```typescript
// web/my-app/public/sw.js
const CACHE_NAME = "bridge-business-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/dashboard",
        "/quick-capture",
        "/customers",
        "/static/js/bundle.js",
      ]);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
```

### ✅ Step 5: Database Extensions (Week 4)

#### Manual Tables Migration

```sql
-- Create manual-specific tables
CREATE TABLE manual_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  capture_type TEXT NOT NULL, -- 'voice', 'photo', 'manual'
  raw_data JSONB,
  processed_data JSONB,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customer_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID REFERENCES entities(id),
  insight_type TEXT NOT NULL,
  insight_data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE business_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  actioned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Update Prisma Schema

```prisma
// apps/api/prisma/schema.prisma
model ManualCapture {
  id             String    @id @default(uuid()) @db.Uuid
  tenantId       String    @map("tenant_id") @db.Uuid
  transactionId  String?   @map("transaction_id") @db.Uuid
  captureType    String    @map("capture_type")
  rawData        Json?      @map("raw_data")
  processedData  Json?      @map("processed_data")
  confidenceScore Decimal? @map("confidence_score") @db.Decimal(3, 2)
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  transaction    Transaction? @relation(fields: [transactionId], references: [id])

  @@map("manual_captures")
}

model CustomerInsight {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String   @map("tenant_id") @db.Uuid
  customerId String   @map("customer_id") @db.Uuid
  insightType String  @map("insight_type")
  insightData Json     @map("insight_data")
  isRead     Boolean  @default(false) @map("is_read")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("customer_insights")
}
```

## Testing Strategy

### Manual User Testing

1. **Recruit Target Users**: 10 shop owners from different business types
2. **Device Testing**: Low-end Android devices (2GB RAM, 3G networks)
3. **Scenario Testing**: Real business transactions in their environment
4. **Accessibility Test**: Users with varying literacy levels

### Performance Testing

```bash
# Test load times on slow networks
npm run lighthouse -- --slow-4g

# Test memory usage
npm run bundle-analyzer

# Test offline functionality
npm run test:offline
```

### Integration Testing

```bash
# Test manual capture flow
npm run test:e2e -- --grep "Manual Capture"

# Test SMS integration
npm run test:integration -- --grep "SMS"

# Test offline sync
npm run test:e2e -- --grep "Offline"
```

## Deployment Checklist

### Backend Deployment

- [ ] Manual service module deployed
- [ ] File upload endpoints configured
- [ ] Speech-to-text API keys set
- [ ] OCR service configured
- [ ] SMS provider setup

### Frontend Deployment

- [ ] PWA manifest configured
- [ ] Service worker registered
- [ ] Touch optimization verified
- [ ] Offline testing passed
- [ ] Performance benchmarks met

### Database Migration

- [ ] Manual tables created
- [ ] Indexes added for performance
- [ ] Sample data seeded
- [ ] Migration tested on staging

## Success Metrics

### Week 1-2 Targets

- **MVP Ready**: Basic manual capture functionality
- **User Testing**: 5+ manual users testing
- **Performance**: <5s load time on 3G
- **Reliability**: 95% uptime

### Week 3-4 Targets

- **PWA Live**: Installable app experience
- **Offline Ready**: 24+ hour offline functionality
- **Voice Working**: 80% transcription accuracy
- **Photo Working**: 70% receipt parsing success

### Week 5-6 Targets

- **100 Users**: Active manual tenants
- **Daily Usage**: 50%+ daily active users
- **Transaction Volume**: 1000+ manual transactions
- **User Satisfaction**: 4.0+ rating

## Common Issues & Solutions

### Voice Recognition Issues

**Problem**: Low accuracy in noisy environments  
**Solution**:

- Noise cancellation preprocessing
- Manual correction interface
- Context-aware suggestions

### Photo Quality Issues

**Problem**: Blurry or poorly lit receipts  
**Solution**:

- Real-time quality assessment
- Guided capture interface
- Manual data entry fallback

### Connectivity Issues

**Problem**: Intermittent internet connectivity  
**Solution**:

- Robust offline queue
- Conflict resolution
- Progressive data sync

### Literacy Challenges

**Problem**: Users struggle with text interfaces  
**Solution**:

- Voice-first interaction
- Icon-based navigation
- Local language support

## Support Resources

### Documentation

- [Manual-First Architecture Guide](./MANUAL_FIRST_ARCHITECTURE.md)
- [Frontend Integration Guide](./FRONTEND_MANUAL_INTEGRATION.md)
- [Service Prioritization](./SERVICE_PRIORITIZATION_MANUAL.md)
- [Key Features](./MANUAL_WORKFLOW_FEATURES.md)

### Tools & Services

- **Speech-to-Text**: Google Cloud Speech API, Azure Speech Services
- **OCR**: Google Vision API, Tesseract.js
- **SMS**: Twilio, Africa's Talking
- **File Storage**: Supabase Storage, AWS S3

### Community

- Slack channel: #project-bridge-manual
- User research participants: Local business associations
- Testing group: Kenya, Tanzania, Uganda shop owners

## Next Steps

1. **Implement Core Services** (Week 1-2)
2. **Build Mobile Interface** (Week 2-3)
3. **Add Intelligence Layer** (Week 3-4)
4. **Deploy and Test** (Week 4-5)
5. **Iterate Based on Feedback** (Week 5-6)

By following this implementation guide, you'll successfully deliver Project Bridge's manual-first approach to serve 80% of African informal economy businesses with simple, powerful tools that drive real business value.
