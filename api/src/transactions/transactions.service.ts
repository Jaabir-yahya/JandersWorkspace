import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UniversalInvoice, getAccountCode } from './interfaces/universal-invoice.interface';

export interface TransactionFilters {
  status?: string;
  type?: string;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  payment_status?: string;
}

export interface EntityHistoryItem {
  transaction_id: string;
  transaction_date: string;
  type: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency_code: string;
  reference: string;
  running_balance: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async create(dto: CreateTransactionDto) {
    // Transform lines to match the database function expectation
    const lines = dto.lines.map(line => ({
      description: line.description,
      sku: line.sku || null,
      quantity: line.quantity,
      unit_price: line.unit_price,
      account_code: line.account_code || '200-SALES',
      metadata: line.metadata || {},
    }));

    const { data, error } = await this.supabase.rpc('create_transaction', {
      p_tenant_id: dto.tenant_id,
      p_entity_id: dto.entity_id || null,
      p_created_by_user_id: dto.created_by_user_id,
      p_txn_type: dto.type,
      p_currency_code: dto.currency_code,
      p_lines: lines,
      p_transaction_date: dto.transaction_date || new Date().toISOString(),
      p_reference: dto.reference || null,
      p_metadata: dto.metadata || {},
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data[0];
  }

  async findAll(tenantId: string, filters?: TransactionFilters) {
    let query = this.supabase
      .from('transactions')
      .select(`
        *,
        entities:entity_id (display_name, phone_number)
      `)
      .eq('tenant_id', tenantId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    if (filters?.date_from) {
      query = query.gte('transaction_date', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('transaction_date', filters.date_to);
    }

    // Search functionality - searches across description, reference, and entity name
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      // Use or filter with ilike for text search
      query = query.or(`reference.ilike.${searchTerm},entities.display_name.ilike.${searchTerm}`);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data: transaction, error: txnError } = await this.supabase
      .from('transactions')
      .select(`
        *,
        entities:entity_id (*)
      `)
      .eq('id', id)
      .single();

    if (txnError) {
      throw new BadRequestException(txnError.message);
    }

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const { data: lines, error: linesError } = await this.supabase
      .from('transaction_lines')
      .select('*')
      .eq('transaction_id', id);

    if (linesError) {
      throw new BadRequestException(linesError.message);
    }

    return { ...transaction, lines };
  }

  async findByEntity(entityId: string) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('entity_id', entityId)
      .order('transaction_date', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  /**
   * Post a transaction (DRAFT -> POSTED)
   * LOCK 2: Once POSTED, transaction becomes immutable
   */
  async postTransaction(id: string, dto: PostTransactionDto) {
    const { data, error } = await this.supabase.rpc('post_transaction', {
      p_transaction_id: id,
      p_user_id: dto.user_id,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return data[0];
  }

  /**
   * Reverse a transaction (POSTED -> creates REVERSAL)
   * LOCK 3: Reversals are first-class transactions with negative amounts
   */
  async reverseTransaction(id: string, dto: ReverseTransactionDto) {
    const { data, error } = await this.supabase.rpc('reverse_transaction', {
      p_original_transaction_id: id,
      p_reason: dto.reason,
      p_created_by_user_id: dto.created_by_user_id,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return data[0];
  }

  /**
   * Update payment status
   * Used in the Reconciler view
   */
  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
    const { data, error } = await this.supabase.rpc('update_payment_status', {
      p_transaction_id: id,
      p_new_status: dto.status,
      p_user_id: dto.user_id,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return data[0];
  }

  /**
   * Get entity history with running balance
   * The "Copper" feature - shows everything an entity has ever done
   */
  async getEntityHistory(entityId: string, tenantId: string): Promise<{
    entity: any;
    transactions: EntityHistoryItem[];
    total_balance: number;
  }> {
    // First get entity details
    const { data: entity, error: entityError } = await this.supabase
      .from('entities')
      .select('*')
      .eq('id', entityId)
      .eq('tenant_id', tenantId)
      .single();

    if (entityError) {
      throw new BadRequestException(entityError.message);
    }

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Get transaction history with running balance
    const { data: history, error: historyError } = await this.supabase.rpc(
      'get_entity_history',
      {
        p_entity_id: entityId,
        p_tenant_id: tenantId,
      }
    );

    if (historyError) {
      throw new BadRequestException(historyError.message);
    }

    // Calculate total balance from the last transaction's running balance
    const totalBalance = history && history.length > 0
      ? history[history.length - 1].running_balance
      : 0;

    return {
      entity,
      transactions: history || [],
      total_balance: totalBalance,
    };
  }

  /**
   * Standardize transaction to Universal Invoice format
   * Compatible with QBO, Xero, and Kick
   */
  async standardizeTransaction(id: string): Promise<UniversalInvoice> {
    const transaction = await this.findOne(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const entityName = transaction.entities?.display_name || 'Unknown';

    // Map transaction type to account code
    const defaultAccountCode = getAccountCode(transaction.type);

    // Transform lines to Universal Invoice format
    const lineItems = transaction.lines?.map((line: any) => ({
      description: line.description,
      quantity: Number(line.quantity),
      unit_price: Number(line.unit_price),
      account_code: line.account_code || defaultAccountCode,
      sku: line.sku,
      line_total: Number(line.total_line_amount),
    })) || [];

    // Build Universal Invoice
    const universalInvoice: UniversalInvoice = {
      invoice_id: transaction.id,
      customer_name: entityName,
      customer_id: transaction.entity_id,
      invoice_date: transaction.transaction_date || transaction.created_at,
      currency: transaction.currency_code,
      total_amount: Number(transaction.total_amount),
      line_items: lineItems,
      tax_amount: 0, // Not implemented in Phase 2
      status: transaction.status,
      payment_status: transaction.payment_status,
      reference: transaction.reference,
      type: transaction.type,
      reversed_transaction_id: transaction.reversed_transaction_id,
      metadata: transaction.metadata,
      created_at: transaction.created_at,
    };

    return universalInvoice;
  }

  /**
   * Search transactions with advanced filters
   * Supports full-text search across multiple fields including SKU
   * G-010: Search functionality includes SKU search
   */
  async searchTransactions(
    tenantId: string,
    searchTerm: string,
    filters?: Omit<TransactionFilters, 'search'>
  ) {
    // First search in transaction_lines for description matches
    const { data: lineMatches, error: lineError } = await this.supabase
      .from('transaction_lines')
      .select('transaction_id')
      .ilike('description', `%${searchTerm}%`);

    if (lineError) {
      throw new BadRequestException(lineError.message);
    }

    // G-010: Also search by SKU in transaction_lines
    const { data: skuMatches, error: skuError } = await this.supabase
      .from('transaction_lines')
      .select('transaction_id')
      .ilike('sku', `%${searchTerm}%`);

    if (skuError) {
      throw new BadRequestException(skuError.message);
    }

    const transactionIdsFromLines = lineMatches?.map(l => l.transaction_id) || [];
    const transactionIdsFromSku = skuMatches?.map(l => l.transaction_id) || [];
    
    // Combine both line matches (description + SKU)
    const allLineTransactionIds = [...new Set([...transactionIdsFromLines, ...transactionIdsFromSku])];

    // Build main query
    let query = this.supabase
      .from('transactions')
      .select(`
        *,
        entities:entity_id (display_name, phone_number)
      `)
      .eq('tenant_id', tenantId);

    // Apply search across multiple fields (G-010: includes SKU search)
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query = query.or([
        `reference.ilike.${searchPattern}`,
        `entities.display_name.ilike.${searchPattern}`,
        `id.in.(${allLineTransactionIds.join(',')})`,
      ].join(','));
    }

    // Apply additional filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters?.date_from) {
      query = query.gte('transaction_date', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('transaction_date', filters.date_to);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // ============================================
  // ENTITY METHODS (Phase 3)
  // ============================================

  async findAllEntities(tenantId: string, filters?: { type?: string; search?: string }) {
    let query = this.supabase
      .from('entities')
      .select('*')
      .eq('tenant_id', tenantId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.or([
        `display_name.ilike.${searchPattern}`,
        `phone_number.ilike.${searchPattern}`,
        `alternate_names.cs.{${filters.search}}`,
      ].join(','));
    }

    const { data, error } = await query.order('display_name');

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async createEntity(dto: any) {
    const { data, error } = await this.supabase
      .from('entities')
      .insert({
        tenant_id: dto.tenant_id,
        type: dto.type,
        display_name: dto.display_name,
        phone_number: dto.phone_number || null,
        linked_phones: dto.linked_phones || [],
        alternate_names: dto.alternate_names || [],
        location: dto.location || null,
        notes: dto.notes || null,
        trust_score: dto.trust_score || 50,
        metadata: dto.metadata || {},
        created_by_user_id: dto.created_by_user_id,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async findEntityById(id: string) {
    const { data, error } = await this.supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return data;
  }

  async getEntityBalance(entityId: string, tenantId: string) {
    // Get entity details
    const entity = await this.findEntityById(entityId);

    // Verify tenant access
    if (entity.tenant_id !== tenantId) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Calculate balance using the database function
    const { data: balanceData, error: balanceError } = await this.supabase.rpc(
      'calculate_entity_balance',
      { p_entity_id: entityId }
    );

    if (balanceError) {
      throw new BadRequestException(balanceError.message);
    }

    const balance = balanceData?.[0] || { total_credit: 0, total_debit: 0, net_balance: 0 };

    // Get transaction count
    const { count, error: countError } = await this.supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', entityId)
      .eq('status', 'POSTED');

    if (countError) {
      throw new BadRequestException(countError.message);
    }

    return {
      entity,
      balance: {
        total_credit: Number(balance.total_credit),
        total_debit: Number(balance.total_debit),
        net_balance: Number(balance.net_balance),
        transaction_count: count || 0,
      },
    };
  }

  async getEntity360View(entityId: string, tenantId: string) {
    // Get entity with balance
    const { entity, balance } = await this.getEntityBalance(entityId, tenantId);

    // Get recent transactions (last 10)
    const { data: recentTransactions, error: txnError } = await this.supabase
      .from('transactions')
      .select('*, lines:transaction_lines(*)')
      .eq('entity_id', entityId)
      .eq('status', 'POSTED')
      .order('transaction_date', { ascending: false })
      .limit(10);

    if (txnError) {
      throw new BadRequestException(txnError.message);
    }

    // Get attachments
    const { data: attachments, error: attachError } = await this.supabase
      .from('attachments')
      .select('*')
      .eq('entity_id', entityId)
      .order('uploaded_at', { ascending: false });

    if (attachError) {
      throw new BadRequestException(attachError.message);
    }

    return {
      entity,
      balance,
      recent_transactions: recentTransactions || [],
      attachments: attachments || [],
    };
  }

  async searchEntitiesByPhone(phone: string, tenantId: string) {
    const { data, error } = await this.supabase.rpc('search_entities_by_phone', {
      p_phone: phone,
      p_tenant_id: tenantId,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async addLinkedPhone(entityId: string, phone: string) {
    // Get current linked phones
    const { data: entity, error: fetchError } = await this.supabase
      .from('entities')
      .select('linked_phones')
      .eq('id', entityId)
      .single();

    if (fetchError || !entity) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Check if phone already exists
    const currentPhones = entity.linked_phones || [];
    if (currentPhones.includes(phone)) {
      throw new BadRequestException('Phone number already linked to this entity');
    }

    // Add new phone
    const { data, error } = await this.supabase
      .from('entities')
      .update({
        linked_phones: [...currentPhones, phone],
      })
      .eq('id', entityId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async removeLinkedPhone(entityId: string, phone: string) {
    // Get current linked phones
    const { data: entity, error: fetchError } = await this.supabase
      .from('entities')
      .select('linked_phones')
      .eq('id', entityId)
      .single();

    if (fetchError || !entity) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Remove phone
    const currentPhones = entity.linked_phones || [];
    const updatedPhones = currentPhones.filter((p: string) => p !== phone);

    const { data, error } = await this.supabase
      .from('entities')
      .update({
        linked_phones: updatedPhones,
      })
      .eq('id', entityId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
