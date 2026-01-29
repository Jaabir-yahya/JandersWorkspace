# Backend Implementation Plan - Bridging Phase 2 to Phase 3

## 🎯 Current Situation

### Frontend Status (v0) ✅ COMPLETE
- **5 Pages**: Transaction Feed, Create Transaction, People/CRM, Proof Vault, Transaction Manager
- **Features**: Split payments, Credit/Udhaari, Linked phones, File attachments, Context/Notes
- **Tech Stack**: Next.js 15, TypeScript, Tailwind, shadcn/ui, SWR
- **Mock Data**: Enabled and working

### Backend Status (Phase 2) ⏳ PARTIAL
- **Basic Transactions**: DRAFT, POSTED, REVERSED
- **Basic Entities**: Single phone number
- **Missing**: Split payments, file storage, credit tracking, linked phones

---

## 🚀 Implementation Priority

### Phase 3.1: Critical Path (Week 1) - MUST HAVE

These are blocking the frontend from working with real data.

#### 1. Database Schema Updates (Day 1-2)

**Priority**: 🔴 CRITICAL - Frontend expects these tables

```sql
-- Update entities table
ALTER TABLE entities ADD COLUMN linked_phones TEXT[];
ALTER TABLE entities ADD COLUMN alternate_names TEXT[];
ALTER TABLE entities ADD COLUMN location TEXT;
ALTER TABLE entities ADD COLUMN notes TEXT;

-- Update transactions table
ALTER TABLE transactions ADD COLUMN linked_transaction_id UUID REFERENCES transactions(id);
ALTER TABLE transactions ADD COLUMN due_date DATE;
ALTER TABLE transactions ADD COLUMN context TEXT;

-- Create payment_records table
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  method VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  reference VARCHAR(255),
  paid_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_records_txn ON payment_records(transaction_id);

-- Create attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by_user_id UUID NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_attachments_entity ON attachments(entity_id);
CREATE INDEX idx_attachments_transaction ON attachments(transaction_id);
```

#### 2. Entity Service Updates (Day 2-3)

**Priority**: 🔴 CRITICAL - People page won't work

```typescript
// api/src/entities/entities.service.ts

// Add linked phone support
async addLinkedPhone(entityId: string, phone: string) {
  const { data, error } = await this.supabase
    .from('entities')
    .update({
      linked_phones: sql`array_append(linked_phones, ${phone})`
    })
    .eq('id', entityId)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Search by any phone number
async searchByPhone(phone: string) {
  const { data, error } = await this.supabase
    .from('entities')
    .select('*')
    .or(`phone_number.eq.${phone},linked_phones.cs.{${phone}}`);
  
  if (error) throw new Error(error.message);
  return data;
}

// Get entity with balance
async getEntityWithBalance(entityId: string) {
  // Get entity
  const { data: entity } = await this.supabase
    .from('entities')
    .select('*')
    .eq('id', entityId)
    .single();
  
  // Get transactions
  const { data: transactions } = await this.supabase
    .from('transactions')
    .select('total_amount, type, status')
    .eq('entity_id', entityId)
    .eq('status', 'POSTED');
  
  // Calculate balance
  const totalCredit = transactions
    .filter(t => ['RETAIL', 'SERVICE', 'RENTAL'].includes(t.type))
    .reduce((sum, t) => sum + t.total_amount, 0);
  
  const totalDebit = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.total_amount, 0);
  
  return {
    ...entity,
    total_credit: totalCredit,
    total_debit: totalDebit,
    net_balance: totalCredit - totalDebit
  };
}
```

#### 3. Transaction Service Updates (Day 3-4)

**Priority**: 🔴 CRITICAL - Create Transaction form won't work

```typescript
// api/src/transactions/transactions.service.ts

// Update create transaction to support split payments
async createTransaction(dto: CreateTransactionDto) {
  // Calculate total from lines
  const totalAmount = dto.lines.reduce(
    (sum, line) => sum + (line.quantity * line.unit_price),
    0
  );
  
  // Create transaction
  const { data: transaction, error } = await this.supabase
    .from('transactions')
    .insert({
      ...dto,
      total_amount: totalAmount,
      status: 'DRAFT',
      payment_status: this.calculatePaymentStatus(dto.payments, totalAmount, dto.due_date)
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  // Create payment records if provided
  if (dto.payments && dto.payments.length > 0) {
    await this.createPaymentRecords(transaction.id, dto.payments);
  }
  
  return transaction;
}

// Calculate payment status
private calculatePaymentStatus(
  payments: PaymentRecord[],
  totalAmount: number,
  dueDate?: Date
): string {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  if (dueDate && totalPaid === 0) return 'CREDIT';
  if (totalPaid === totalAmount) return 'PAID';
  if (totalPaid > 0 && totalPaid < totalAmount) return 'PARTIAL';
  return 'PENDING';
}

// Create payment records
async createPaymentRecords(transactionId: string, payments: PaymentRecord[]) {
  const { error } = await this.supabase
    .from('payment_records')
    .insert(
      payments.map(p => ({
        ...p,
        transaction_id: transactionId,
        paid_at: p.paid_at || new Date().toISOString()
      }))
    );
  
  if (error) throw new Error(error.message);
}
```

#### 4. File Upload Service (Day 4-5)

**Priority**: 🔴 CRITICAL - Proof Vault won't work

```typescript
// api/src/files/files.service.ts

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FilesService {
  constructor(private supabase: SupabaseService) {}

  async uploadFile(
    file: Express.Multer.File,
    entityId?: string,
    transactionId?: string,
    userId: string
  ) {
    // Determine file type
    const fileType = this.detectFileType(file.mimetype);
    
    // Generate unique filename
    const filename = `${uuidv4()}-${file.originalname}`;
    
    // Upload to Supabase Storage
    const { data, error } = await this.supabase.client.storage
      .from('attachments')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    
    if (error) throw new Error(error.message);
    
    // Get public URL
    const { data: { publicUrl } } = this.supabase.client.storage
      .from('attachments')
      .getPublicUrl(filename);
    
    // Save to database
    const { data: attachment, error: dbError } = await this.supabase
      .from('attachments')
      .insert({
        entity_id: entityId,
        transaction_id: transactionId,
        file_name: file.originalname,
        file_type: fileType,
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by_user_id: userId
      })
      .select()
      .single();
    
    if (dbError) throw new Error(dbError.message);
    return attachment;
  }
  
  private detectFileType(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'IMAGE';
    if (mimetype === 'application/pdf') return 'PDF';
    if (mimetype.startsWith('audio/')) return 'AUDIO';
    return 'OTHER';
  }
  
  async getAttachmentsByTransaction(transactionId: string) {
    const { data, error } = await this.supabase
      .from('attachments')
      .select('*')
      .eq('transaction_id', transactionId);
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  async getAttachmentsByEntity(entityId: string) {
    const { data, error } = await this.supabase
      .from('attachments')
      .select('*')
      .eq('entity_id', entityId);
    
    if (error) throw new Error(error.message);
    return data;
  }
}
```

#### 5. Controller Updates (Day 5)

**Priority**: 🔴 CRITICAL - API endpoints won't match frontend

```typescript
// api/src/entities/entities.controller.ts

@Post(':id/linked-phones')
async addLinkedPhone(@Param('id') id: string, @Body() dto: { phone: string }) {
  return this.entitiesService.addLinkedPhone(id, dto.phone);
}

@Get('search')
async searchByPhone(@Query('phone') phone: string) {
  return this.entitiesService.searchByPhone(phone);
}

@Get(':id/profile')
async getEntityProfile(@Param('id') id: string) {
  return this.entitiesService.getEntityWithBalance(id);
}

// api/src/files/files.controller.ts

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: { entity_id?: string; transaction_id?: string; user_id: string }
) {
  return this.filesService.uploadFile(
    file,
    dto.entity_id,
    dto.transaction_id,
    dto.user_id
  );
}

@Get()
async getAttachments(@Query('transaction_id') transactionId?: string, @Query('entity_id') entityId?: string) {
  if (transactionId) {
    return this.filesService.getAttachmentsByTransaction(transactionId);
  }
  if (entityId) {
    return this.filesService.getAttachmentsByEntity(entityId);
  }
}
```

---

### Phase 3.2: High Value (Week 2) - SHOULD HAVE

These features maximize value of existing data.

#### 1. Overdue Detection (Day 1-2)

**Priority**: 🟡 HIGH - Critical for credit management

```typescript
// api/src/transactions/transactions.service.ts

async getOverdueTransactions() {
  const { data, error } = await this.supabase
    .from('transactions')
    .select('*')
    .eq('payment_status', 'CREDIT')
    .lt('due_date', new Date().toISOString().split('T')[0])
    .order('due_date', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
}

// Add to controller
@Get('overdue')
async getOverdue() {
  return this.transactionsService.getOverdueTransactions();
}
```

**Frontend Integration**:
- Add "Overdue" badge on People page
- Show overdue transactions in red
- Send daily email notifications (Phase 4)

#### 2. Entity Trust Score (Day 2-3)

**Priority**: 🟡 HIGH - Helps prioritize collections

```typescript
// api/src/entities/entities.service.ts

async calculateTrustScore(entityId: string): Promise<number> {
  // Get all transactions
  const { data: transactions } = await this.supabase
    .from('transactions')
    .select('payment_status, due_date, total_amount, created_at')
    .eq('entity_id', entityId);
  
  let score = 50; // Base score
  
  // Bonus for on-time payments
  const onTimePayments = transactions.filter(t => {
    if (t.payment_status !== 'PAID') return false;
    if (!t.due_date) return true;
    return new Date(t.created_at) <= new Date(t.due_date);
  });
  score += onTimePayments.length * 5;
  
  // Penalty for overdue
  const overdue = transactions.filter(t => {
    if (t.payment_status !== 'CREDIT') return false;
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });
  score -= overdue.length * 10;
  
  // Bonus for volume
  score += Math.min(transactions.length * 2, 20);
  
  return Math.max(0, Math.min(100, score));
}
```

**Frontend Integration**:
- Show trust score on People page (0-100 scale)
- Color code: Green (80-100), Yellow (50-79), Red (0-49)
- Sort entities by trust score

#### 3. Transaction Analytics (Day 3-4)

**Priority**: 🟡 HIGH - Business insights without integrations

```typescript
// api/src/analytics/analytics.service.ts

@Injectable()
export class AnalyticsService {
  constructor(private supabase: SupabaseService) {}
  
  async getDailyRevenue(startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('transaction_date, total_amount, type')
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString())
      .eq('status', 'POSTED')
      .in('type', ['RETAIL', 'SERVICE', 'RENTAL']);
    
    if (error) throw new Error(error.message);
    
    // Group by date
    const dailyRevenue = data.reduce((acc, t) => {
      const date = t.transaction_date.split('T')[0];
      acc[date] = (acc[date] || 0) + t.total_amount;
      return acc;
    }, {});
    
    return dailyRevenue;
  }
  
  async getTopCustomers(limit: number = 10) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('entity_id, total_amount')
      .eq('status', 'POSTED')
      .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
      .order('total_amount', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(error.message);
    
    // Get entity details
    const entityIds = [...new Set(data.map(t => t.entity_id))];
    const { data: entities } = await this.supabase
      .from('entities')
      .select('id, display_name')
      .in('id', entityIds);
    
    // Merge data
    return data.map(t => ({
      ...t,
      entity: entities.find(e => e.id === t.entity_id)
    }));
  }
  
  async getPaymentMethodBreakdown(startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('payment_records')
      .select('method, amount')
      .gte('paid_at', startDate.toISOString())
      .lte('paid_at', endDate.toISOString());
    
    if (error) throw new Error(error.message);
    
    // Group by method
    const breakdown = data.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {});
    
    return breakdown;
  }
}
```

**Frontend Integration**:
- Add "Analytics" page (Page 6)
- Show daily revenue chart
- Show top customers list
- Show payment method breakdown (CASH vs M-PESA)

---

### Phase 3.3: Creative Maximization (Week 3) - NICE TO HAVE

These features maximize value WITHOUT external integrations.

#### 1. Smart Context Extraction (Day 1-2)

**Priority**: 🟢 MEDIUM - Learn from user behavior

**Idea**: Parse Context field to extract structured data

```typescript
// api/src/transactions/context-parser.service.ts

@Injectable()
export class ContextParserService {
  extractDeliveryAddress(context: string): string | null {
    // Pattern: "Deliver to [location]"
    const match = context.match(/deliver to (.+?)(?:,|$)/i);
    return match ? match[1].trim() : null;
  }
  
  extractWhatsAppId(context: string): string | null {
    // Pattern: "wa_me_12345" or similar
    const match = context.match(/wa[_\w]+_\d+/i);
    return match ? match[0] : null;
  }
  
  extractTags(context: string): string[] {
    // Pattern: #tag1, #tag2
    const matches = context.match(/#\w+/g);
    return matches || [];
  }
  
  async analyzeAndStore(transactionId: string, context: string) {
    const deliveryAddress = this.extractDeliveryAddress(context);
    const whatsappId = this.extractWhatsAppId(context);
    const tags = this.extractTags(context);
    
    // Store in metadata for future use
    await this.supabase
      .from('transactions')
      .update({
        metadata: {
          extracted_delivery_address: deliveryAddress,
          extracted_whatsapp_id: whatsappId,
          extracted_tags: tags
        }
      })
      .eq('id', transactionId);
  }
}
```

**Frontend Integration**:
- Auto-suggest delivery address based on history
- Show WhatsApp link if ID detected
- Auto-tag transactions

#### 2. Duplicate Detection (Day 2-3)

**Priority**: 🟢 MEDIUM - Prevent data entry errors

```typescript
// api/src/transactions/duplicate-detection.service.ts

@Injectable()
export class DuplicateDetectionService {
  async findPotentialDuplicates(transaction: CreateTransactionDto) {
    // Check for same entity + similar amount + recent date
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('entity_id', transaction.entity_id)
      .gte('transaction_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('transaction_date', { ascending: false })
      .limit(10);
    
    if (error) throw new Error(error.message);
    
    // Find similar amounts (within 10%)
    const similar = data.filter(t => {
      const diff = Math.abs(t.total_amount - transaction.lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0));
      const percentDiff = (diff / t.total_amount) * 100;
      return percentDiff <= 10;
    });
    
    return similar;
  }
}
```

**Frontend Integration**:
- Show warning when creating similar transaction
- "Did you mean to link to existing transaction?"
- Prevent duplicate entries

#### 3. Bulk Operations (Day 3-4)

**Priority**: 🟢 MEDIUM - Efficiency for power users

```typescript
// api/src/transactions/bulk-operations.service.ts

@Injectable()
export class BulkOperationsService {
  async bulkPostTransactions(transactionIds: string[], userId: string) {
    const results = [];
    for (const id of transactionIds) {
      try {
        await this.supabase
          .from('transactions')
          .update({ status: 'POSTED' })
          .eq('id', id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }
  
  async bulkReverseTransactions(transactions: Array<{ id: string; reason: string }>, userId: string) {
    const results = [];
    for (const { id, reason } of transactions) {
      try {
        // Create reversal
        const original = await this.supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();
        
        await this.supabase
          .from('transactions')
          .insert({
            ...original,
            id: undefined,
            status: 'REVERSED',
            reversed_transaction_id: id,
            total_amount: -original.total_amount,
            lines: original.lines.map(l => ({
              ...l,
              id: undefined,
              total_line_amount: -l.total_line_amount
            }))
          });
        
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }
}
```

**Frontend Integration**:
- Add "Bulk Post" button on Transaction Manager
- Add "Bulk Reverse" with reason
- Show progress indicator

---

### Phase 3.4: Pre-Integration Prep (Week 4) - STRATEGIC

These features prepare for future integrations.

#### 1. Webhook Infrastructure (Day 1-2)

**Priority**: 🟢 MEDIUM - Ready for M-Pesa, WhatsApp

```typescript
// api/src/webhooks/webhooks.controller.ts

@Controller('webhooks')
export class WebhooksController {
  @Post('mpesa')
  async handleMpesaWebhook(@Body() payload: any, @Headers() headers: any) {
    // Validate signature (Phase 4)
    // Store webhook event
    await this.supabase
      .from('webhook_events')
      .insert({
        source: 'MPESA',
        payload,
        headers,
        received_at: new Date(),
        processed: false
      });
    
    // Return 200 immediately
    return { received: true };
  }
  
  @Post('whatsapp')
  async handleWhatsAppWebhook(@Body() payload: any) {
    // Store webhook event
    await this.supabase
      .from('webhook_events')
      .insert({
        source: 'WHATSAPP',
        payload,
        received_at: new Date(),
        processed: false
      });
    
    return { received: true };
  }
}
```

**Frontend Integration**:
- Show "Webhook Events" page (Page 7)
- Display raw webhook payloads
- Allow manual processing (Phase 4)

#### 2. Export/Import (Day 2-3)

**Priority**: 🟢 MEDIUM - Data portability

```typescript
// api/src/export/export.service.ts

@Injectable()
export class ExportService {
  async exportTransactions(filters: TransactionFilters): Promise<string> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .match(filters);
    
    if (error) throw new Error(error.message);
    
    // Convert to CSV
    const csv = this.convertToCSV(data);
    return csv;
  }
  
  async importTransactions(csvData: string): Promise<{ success: number; errors: any[] }> {
    const rows = this.parseCSV(csvData);
    const results = { success: 0, errors: [] };
    
    for (const row of rows) {
      try {
        await this.createTransaction(row);
        results.success++;
      } catch (error) {
        results.errors.push({ row, error: error.message });
      }
    }
    
    return results;
  }
  
  private convertToCSV(data: any[]): string {
    const headers = ['id', 'date', 'customer', 'type', 'amount', 'status'];
    const rows = data.map(t => [
      t.id,
      t.transaction_date,
      t.entity?.display_name,
      t.type,
      t.total_amount / 100,
      t.status
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
```

**Frontend Integration**:
- Add "Export" button on Transaction Feed
- Add "Import" button on Transaction Manager
- Show import results with errors

---

## 🎯 Creative Maximization Ideas

### 1. "Smart Notebook" Features

**Idea**: Make the system learn from user behavior

**Implementation**:
- Track which fields users fill in most
- Auto-suggest based on history
- Learn delivery patterns (e.g., "Karen, Gate B" appears 80% of time)
- Suggest due dates based on customer history

**Value**: Reduces data entry time by 50%

### 2. "Digital Receipt" Generation

**Idea**: Generate printable receipts from transactions

**Implementation**:
```typescript
// api/src/receipts/receipts.service.ts

@Injectable()
export class ReceiptsService {
  async generateReceipt(transactionId: string): Promise<Buffer> {
    const transaction = await this.getTransaction(transactionId);
    
    // Generate PDF using pdf-lib or similar
    const pdf = await this.createPDF({
      title: 'RECEIPT',
      date: transaction.transaction_date,
      customer: transaction.entity.display_name,
      items: transaction.lines,
      total: transaction.total_amount,
      payments: transaction.payments
    });
    
    return pdf;
  }
}
```

**Frontend Integration**:
- Add "Print Receipt" button on Transaction Detail
- Add "Email Receipt" button
- Store generated receipts in attachments

### 3. "Credit Dashboard"

**Idea**: Dedicated view for managing Udhaari

**Implementation**:
- Show all credit transactions
- Group by due date
- Show overdue in red
- Show "Collect Today" list
- One-click "Mark as Paid"

**Frontend Integration**:
- Add "Credits" page (Page 8)
- Show credit summary by customer
- Show collection priority

### 4. "Payment Reminder" System

**Idea**: Automated reminders for overdue credits

**Implementation**:
```typescript
// api/src/reminders/reminders.service.ts

@Injectable()
export class RemindersService {
  async sendDailyReminders() {
    const overdue = await this.getOverdueTransactions();
    
    for (const transaction of overdue) {
      // Check if reminder already sent today
      const alreadySent = await this.checkReminderSent(transaction.id);
      if (alreadySent) continue;
      
      // Send reminder (Phase 4: WhatsApp/SMS)
      // For now, just log it
      await this.supabase
        .from('reminders')
        .insert({
          transaction_id: transaction.id,
          sent_at: new Date(),
          method: 'LOGGED'
        });
    }
  }
}
```

**Frontend Integration**:
- Show "Reminders Sent" indicator on transactions
- Allow manual "Send Reminder" button
- Track reminder history

---

## 📊 Implementation Timeline

### Week 1: Critical Path
- Day 1-2: Database schema updates
- Day 2-3: Entity service updates
- Day 3-4: Transaction service updates
- Day 4-5: File upload service
- Day 5: Controller updates

**Goal**: Frontend can work with real data

### Week 2: High Value
- Day 1-2: Overdue detection
- Day 2-3: Entity trust score
- Day 3-4: Transaction analytics

**Goal**: Business insights without integrations

### Week 3: Creative Maximization
- Day 1-2: Smart context extraction
- Day 2-3: Duplicate detection
- Day 3-4: Bulk operations

**Goal**: Efficiency and learning

### Week 4: Pre-Integration Prep
- Day 1-2: Webhook infrastructure
- Day 2-3: Export/Import

**Goal**: Ready for M-Pesa, WhatsApp

---

## ✅ Success Criteria

### Week 1
- [ ] Frontend can create transactions with split payments
- [ ] Frontend can upload files
- [ ] Frontend can add linked phone numbers
- [ ] Frontend can view entity profiles with balance
- [ ] All 5 pages work with real data

### Week 2
- [ ] Overdue transactions are detected
- [ ] Trust scores are calculated
- [ ] Analytics page shows insights
- [ ] Payment method breakdown is available

### Week 3
- [ ] Context is parsed for delivery addresses
- [ ] Duplicate warnings are shown
- [ ] Bulk operations work
- [ ] Data entry time is reduced

### Week 4
- [ ] Webhooks are received and stored
- [ ] Export/Import works
- [ ] System is ready for integrations

---

## 🚀 Next Steps After Implementation

1. **Deploy to Production**
   - Backend to Railway/Render
   - Frontend to Vercel
   - Database to Supabase Cloud

2. **User Testing**
   - Onboard 5-10 real users
   - Collect feedback
   - Observe usage patterns

3. **Phase 4: Integrations**
   - M-Pesa API integration
   - WhatsApp Business API integration
   - Email notifications
   - SMS reminders

4. **Phase 5: Advanced Features**
   - AI-powered insights
   - Predictive analytics
   - Automated reconciliation
   - Multi-currency support

---

**Last Updated**: 2026-01-29
**Phase**: 3 - Backend Implementation
**Status**: Ready to Execute
