# v0 Backend Build Prompt - Project Bridge Phase 3

## 🎯 Mission

Build the backend infrastructure to support the complete Phase 3 frontend (already built by v0). The frontend is a "Digital Notebook" for African informal economy - now we need to build the headless backend to make it permanent.

---

## 📊 Current State

### Frontend (v0) ✅ COMPLETE
- **5 Pages**: Transaction Feed, Create Transaction, People/CRM, Proof Vault, Transaction Manager
- **Features**: Split payments, Credit/Udhaari, Linked phones, File attachments, Context/Notes
- **Tech Stack**: Next.js 15, TypeScript, Tailwind, shadcn/ui, SWR
- **Mock Data**: Enabled and working perfectly

### Backend (Phase 2) ⏳ NEEDS PHASE 3 FEATURES
- **Has**: Basic transactions, basic entities, state machine
- **Missing**: Split payments, file storage, credit tracking, linked phones, context field

---

## 🚀 What to Build - Priority Order

### Priority 1: Database Schema (CRITICAL - Day 1)

Create migration script: `supabase/migrations/20260129_add_phase3_features.sql`

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

**Requirements**:
- Run migration on local Supabase
- Verify all tables created correctly
- Test with sample data

---

### Priority 2: Entity Service Updates (CRITICAL - Day 2-3)

Update `api/src/entities/entities.service.ts`:

#### Add These Methods:

```typescript
// Add linked phone to entity
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

// Remove linked phone from entity
async removeLinkedPhone(entityId: string, phone: string) {
  const { data, error } = await this.supabase
    .from('entities')
    .update({
      linked_phones: sql`array_remove(linked_phones, ${phone})`
    })
    .eq('id', entityId)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Search entities by any phone number (main or linked)
async searchByPhone(phone: string) {
  const { data, error } = await this.supabase
    .from('entities')
    .select('*')
    .or(`phone_number.eq.${phone},linked_phones.cs.{${phone}}`);
  
  if (error) throw new Error(error.message);
  return data;
}

// Get entity with balance calculation
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

// Get all entities with balances
async getEntitiesWithBalances() {
  const { data: entities } = await this.supabase
    .from('entities')
    .select('*');
  
  // Get all transactions
  const { data: transactions } = await this.supabase
    .from('transactions')
    .select('entity_id, total_amount, type, status')
    .eq('status', 'POSTED');
  
  // Calculate balances for each entity
  const entitiesWithBalances = entities.map(entity => {
    const entityTransactions = transactions.filter(t => t.entity_id === entity.id);
    const totalCredit = entityTransactions
      .filter(t => ['RETAIL', 'SERVICE', 'RENTAL'].includes(t.type))
      .reduce((sum, t) => sum + t.total_amount, 0);
    const totalDebit = entityTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.total_amount, 0);
    
    return {
      ...entity,
      total_credit: totalCredit,
      total_debit: totalDebit,
      net_balance: totalCredit - totalDebit
    };
  });
  
  return entitiesWithBalances;
}
```

#### Update Controller `api/src/entities/entities.controller.ts`:

```typescript
@Post(':id/linked-phones')
async addLinkedPhone(@Param('id') id: string, @Body() dto: { phone: string }) {
  return this.entitiesService.addLinkedPhone(id, dto.phone);
}

@Delete(':id/linked-phones')
async removeLinkedPhone(@Param('id') id: string, @Body() dto: { phone: string }) {
  return this.entitiesService.removeLinkedPhone(id, dto.phone);
}

@Get('search')
async searchByPhone(@Query('phone') phone: string) {
  return this.entitiesService.searchByPhone(phone);
}

@Get(':id/profile')
async getEntityProfile(@Param('id') id: string) {
  return this.entitiesService.getEntityWithBalance(id);
}

@Get('with-balances')
async getEntitiesWithBalances() {
  return this.entitiesService.getEntitiesWithBalances();
}
```

---

### Priority 3: Transaction Service Updates (CRITICAL - Day 3-4)

Update `api/src/transactions/transactions.service.ts`:

#### Add These Methods:

```typescript
// Update create transaction to support split payments
async createTransaction(dto: CreateTransactionDto) {
  // Calculate total from lines
  const totalAmount = dto.lines.reduce(
    (sum, line) => sum + (line.quantity * line.unit_price),
    0
  );
  
  // Calculate payment status
  const paymentStatus = this.calculatePaymentStatus(dto.payments, totalAmount, dto.due_date);
  
  // Create transaction
  const { data: transaction, error } = await this.supabase
    .from('transactions')
    .insert({
      ...dto,
      total_amount: totalAmount,
      status: 'DRAFT',
      payment_status: paymentStatus
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

// Calculate payment status based on payments and due date
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

// Get payment records for a transaction
async getPaymentRecords(transactionId: string) {
  const { data, error } = await this.supabase
    .from('payment_records')
    .select('*')
    .eq('transaction_id', transactionId);
  
  if (error) throw new Error(error.message);
  return data;
}

// Get overdue transactions
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
```

#### Update Controller `api/src/transactions/transactions.controller.ts`:

```typescript
@Get(':id/payment-records')
async getPaymentRecords(@Param('id') id: string) {
  return this.transactionsService.getPaymentRecords(id);
}

@Get('overdue')
async getOverdue() {
  return this.transactionsService.getOverdueTransactions();
}
```

---

### Priority 4: File Upload Service (CRITICAL - Day 4-5)

Create `api/src/files/files.service.ts`:

```typescript
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
  
  async deleteAttachment(id: string) {
    // Get attachment to get filename
    const { data: attachment } = await this.supabase
      .from('attachments')
      .select('file_url')
      .eq('id', id)
      .single();
    
    if (!attachment) throw new Error('Attachment not found');
    
    // Extract filename from URL
    const filename = attachment.file_url.split('/').pop();
    
    // Delete from storage
    const { error: storageError } = await this.supabase.client.storage
      .from('attachments')
      .remove([filename]);
    
    if (storageError) throw new Error(storageError.message);
    
    // Delete from database
    const { error: dbError } = await this.supabase
      .from('attachments')
      .delete()
      .eq('id', id);
    
    if (dbError) throw new Error(dbError.message);
  }
}
```

Create `api/src/files/files.controller.ts`:

```typescript
import { Controller, Post, Get, Delete, Param, Query, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

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
    return [];
  }

  @Delete(':id')
  async deleteAttachment(@Param('id') id: string) {
    return this.filesService.deleteAttachment(id);
  }
}
```

Create `api/src/files/files.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
```

Update `api/src/app.module.ts`:

```typescript
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    // ... existing imports
    FilesModule,
  ],
  // ... rest of module
})
export class AppModule {}
```

---

### Priority 5: Update DTOs (Day 5)

Update `api/src/transactions/dto/create-transaction.dto.ts`:

```typescript
export class CreateTransactionDto {
  @IsUUID()
  tenant_id: string;

  @IsUUID()
  created_by_user_id: string;

  @IsUUID()
  entity_id: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  currency_code: string;

  @IsDateString()
  transaction_date: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsUUID()
  linked_transaction_id?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsArray()
  @ValidateNested({ each: true })
  lines: CreateTransactionLineDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  payments?: PaymentRecordDto[];
}

export class PaymentRecordDto {
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsDateString()
  paid_at?: string;
}
```

---

## ✅ Success Criteria

### Week 1 Complete When:
- [ ] Migration script created and run successfully
- [ ] All 5 new tables/columns exist in database
- [ ] Entity service has linked phone methods
- [ ] Entity service has balance calculation
- [ ] Transaction service supports split payments
- [ ] Transaction service calculates payment status correctly
- [ ] File upload service works
- [ ] All new endpoints are accessible
- [ ] Frontend can create transactions with split payments
- [ ] Frontend can upload files
- [ ] Frontend can add linked phone numbers
- [ ] Frontend can view entity profiles with balance
- [ ] All 5 pages work with real data (mock disabled)

---

## 📝 Implementation Notes

### Amount Storage
- **ALWAYS store amounts as integers in cents**
- Example: 1,500 KES = 150000 (stored as integer)
- Frontend handles conversion using `formatCurrency()` helper

### Phone Number Format
- Use E.164 format: `+254711111111` (no spaces, dashes, or parentheses)
- Validate on backend: Must start with `+` and country code

### Transaction Status Flow
```
DRAFT → (post) → POSTED → (reverse) → REVERSED
```

### Payment Status Logic
```javascript
if (payments.sum === total_amount) → PAID
if (payments.sum > 0 && payments.sum < total_amount) → PARTIAL
if (payments.sum === 0 && due_date exists) → CREDIT
if (payments.sum === 0) → PENDING
if (due_date < today && payment_status != PAID) → OVERDUE
```

### Balance Calculation
```javascript
// For CUSTOMER entities:
net_balance = SUM(transactions where type=RETAIL/SERVICE and status=POSTED)
            - SUM(payments.amount)

// For SUPPLIER entities:
net_balance = SUM(payments.amount)
            - SUM(transactions where type=EXPENSE and status=POSTED)
```

### File Storage Best Practices
- Generate unique filenames: `{uuid}-{original_filename}`
- Validate file types on backend
- Enforce size limits (e.g., 10MB for images, 50MB for PDFs)
- Use signed URLs with expiration for cloud storage
- Implement virus scanning for production

---

## 🎯 Testing Instructions

After implementation:

1. **Disable Mock Data**:
   ```typescript
   // In frontend/lib/mock-data.ts
   export const USE_MOCK_DATA = false;
   ```

2. **Test Split Payments**:
   - Create transaction with 2 payment methods
   - Verify both payments are saved
   - Verify payment status is PAID

3. **Test Credit Transactions**:
   - Create transaction with due date, no payments
   - Verify payment status is CREDIT
   - Verify due date is set

4. **Test Linked Phones**:
   - Create entity with main phone
   - Add linked phone
   - Search by linked phone
   - Verify entity is found

5. **Test File Uploads**:
   - Upload receipt image
   - Verify file is attached
   - View transaction detail
   - Verify thumbnail is shown
   - Download file

6. **Test Entity Profiles**:
   - View entity profile
   - Verify balance is calculated
   - Verify transaction history is shown
   - Verify linked phones are shown

---

## 🚀 Next Steps After Week 1

1. **Deploy to Production**
   - Backend to Railway/Render
   - Frontend to Vercel
   - Database to Supabase Cloud

2. **User Testing**
   - Onboard 5-10 real users
   - Collect feedback
   - Observe usage patterns

3. **Week 2-4 Features**
   - Overdue detection
   - Trust scores
   - Analytics
   - Smart context extraction
   - Duplicate detection
   - Bulk operations

4. **Phase 4: Integrations**
   - M-Pesa API integration
   - WhatsApp Business API integration
   - Email notifications
   - SMS reminders

---

## 💡 Key Insight

**"Build a Digital Notebook that is smarter than a physical notebook. That is the only way to win."**

The frontend is your "Digital Notebook" - now build the headless backend to make it permanent!

---

**Last Updated**: 2026-01-29
**Phase**: 3 - Backend Implementation
**Status**: Ready to Execute
