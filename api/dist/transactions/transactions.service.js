"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../supabase/supabase.module");
const universal_invoice_interface_1 = require("./interfaces/universal-invoice.interface");
let TransactionsService = class TransactionsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async create(dto) {
        const lines = dto.lines.map(line => ({
            description: line.description,
            sku: line.sku || null,
            quantity: line.quantity,
            unit_price: line.unit_price,
            account_code: line.account_code || '200-SALES',
            metadata: line.metadata || {},
        }));
        const paymentRecords = dto.payment_records?.map(pr => ({
            method: pr.method,
            amount: pr.amount,
            reference: pr.reference || null,
            paid_at: pr.paid_at || new Date().toISOString(),
        })) || null;
        const { data, error } = await this.supabase.rpc('create_transaction', {
            p_tenant_id: dto.tenant_id,
            p_entity_id: dto.entity_id || null,
            p_created_by_user_id: dto.created_by_user_id,
            p_txn_type: dto.type,
            p_currency_code: dto.currency_code,
            p_lines: lines,
            p_reference: dto.reference || null,
            p_due_date: dto.due_date || null,
            p_context: dto.context || null,
            p_tags: dto.tags || [],
            p_payment_records: paymentRecords,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data[0];
    }
    async findAll(tenantId, filters) {
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
        if (filters?.search) {
            const searchTerm = `%${filters.search}%`;
            query = query.or(`reference.ilike.${searchTerm},entities.display_name.ilike.${searchTerm}`);
        }
        const { data, error } = await query.order('transaction_date', { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async findOne(id) {
        const { data: transaction, error: txnError } = await this.supabase
            .from('transactions')
            .select(`
        *,
        entities:entity_id (*)
      `)
            .eq('id', id)
            .single();
        if (txnError) {
            throw new common_1.BadRequestException(txnError.message);
        }
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        const { data: lines, error: linesError } = await this.supabase
            .from('transaction_lines')
            .select('*')
            .eq('transaction_id', id);
        if (linesError) {
            throw new common_1.BadRequestException(linesError.message);
        }
        return { ...transaction, lines };
    }
    async findByEntity(entityId) {
        const { data, error } = await this.supabase
            .from('transactions')
            .select('*')
            .eq('entity_id', entityId)
            .order('transaction_date', { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async postTransaction(id, dto) {
        const { data, error } = await this.supabase.rpc('post_transaction', {
            p_transaction_id: id,
            p_user_id: dto.user_id,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        if (!data || data.length === 0) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        return data[0];
    }
    async reverseTransaction(id, dto) {
        const { data, error } = await this.supabase.rpc('reverse_transaction', {
            p_original_transaction_id: id,
            p_reason: dto.reason,
            p_created_by_user_id: dto.created_by_user_id,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        if (!data || data.length === 0) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        return data[0];
    }
    async updatePaymentStatus(id, dto) {
        const { data, error } = await this.supabase.rpc('update_payment_status', {
            p_transaction_id: id,
            p_new_status: dto.status,
            p_user_id: dto.user_id,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        if (!data || data.length === 0) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        return data[0];
    }
    async getEntityHistory(entityId, tenantId) {
        const { data: entity, error: entityError } = await this.supabase
            .from('entities')
            .select('*')
            .eq('id', entityId)
            .eq('tenant_id', tenantId)
            .single();
        if (entityError) {
            throw new common_1.BadRequestException(entityError.message);
        }
        if (!entity) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const { data: history, error: historyError } = await this.supabase.rpc('get_entity_history', {
            p_entity_id: entityId,
            p_tenant_id: tenantId,
        });
        if (historyError) {
            throw new common_1.BadRequestException(historyError.message);
        }
        const totalBalance = history && history.length > 0
            ? history[history.length - 1].running_balance
            : 0;
        return {
            entity,
            transactions: history || [],
            total_balance: totalBalance,
        };
    }
    async standardizeTransaction(id) {
        const transaction = await this.findOne(id);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        const entityName = transaction.entities?.display_name || 'Unknown';
        const defaultAccountCode = (0, universal_invoice_interface_1.getAccountCode)(transaction.type);
        const lineItems = transaction.lines?.map((line) => ({
            description: line.description,
            quantity: Number(line.quantity),
            unit_price: Number(line.unit_price),
            account_code: line.account_code || defaultAccountCode,
            sku: line.sku,
            line_total: Number(line.total_line_amount),
        })) || [];
        const universalInvoice = {
            invoice_id: transaction.id,
            customer_name: entityName,
            customer_id: transaction.entity_id,
            invoice_date: transaction.transaction_date || transaction.created_at,
            currency: transaction.currency_code,
            total_amount: Number(transaction.total_amount),
            line_items: lineItems,
            tax_amount: 0,
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
    async searchTransactions(tenantId, searchTerm, filters) {
        const { data: lineMatches, error: lineError } = await this.supabase
            .from('transaction_lines')
            .select('transaction_id')
            .ilike('description', `%${searchTerm}%`);
        if (lineError) {
            throw new common_1.BadRequestException(lineError.message);
        }
        const { data: skuMatches, error: skuError } = await this.supabase
            .from('transaction_lines')
            .select('transaction_id')
            .ilike('sku', `%${searchTerm}%`);
        if (skuError) {
            throw new common_1.BadRequestException(skuError.message);
        }
        const transactionIdsFromLines = lineMatches?.map(l => l.transaction_id) || [];
        const transactionIdsFromSku = skuMatches?.map(l => l.transaction_id) || [];
        const allLineTransactionIds = [...new Set([...transactionIdsFromLines, ...transactionIdsFromSku])];
        let query = this.supabase
            .from('transactions')
            .select(`
        *,
        entities:entity_id (display_name, phone_number)
      `)
            .eq('tenant_id', tenantId);
        if (searchTerm) {
            const searchPattern = `%${searchTerm}%`;
            query = query.or([
                `reference.ilike.${searchPattern}`,
                `entities.display_name.ilike.${searchPattern}`,
                `id.in.(${allLineTransactionIds.join(',')})`,
            ].join(','));
        }
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
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async findAllEntities(tenantId, filters) {
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
            throw new common_1.BadRequestException(error.message);
        }
        return data || [];
    }
    async createEntity(dto) {
        const { data, error } = await this.supabase
            .from('entities')
            .insert({
            tenant_id: dto.tenant_id,
            type: dto.type,
            display_name: dto.display_name,
            phone_number: dto.phone_number || null,
            metadata: dto.metadata || {},
            created_by_user_id: dto.created_by_user_id,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async findEntityById(id) {
        const { data, error } = await this.supabase
            .from('entities')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        if (!data) {
            throw new common_1.NotFoundException(`Entity with ID ${id} not found`);
        }
        return data;
    }
    async getEntityBalance(entityId, tenantId) {
        const entity = await this.findEntityById(entityId);
        if (entity.tenant_id !== tenantId) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const { data: balanceData, error: balanceError } = await this.supabase.rpc('calculate_entity_balance', { p_entity_id: entityId });
        if (balanceError) {
            throw new common_1.BadRequestException(balanceError.message);
        }
        const balance = balanceData?.[0] || { total_credit: 0, total_debit: 0, net_balance: 0 };
        const { count, error: countError } = await this.supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('entity_id', entityId)
            .eq('status', 'POSTED');
        if (countError) {
            throw new common_1.BadRequestException(countError.message);
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
    async getEntity360View(entityId, tenantId) {
        const { entity, balance } = await this.getEntityBalance(entityId, tenantId);
        const { data: recentTransactions, error: txnError } = await this.supabase
            .from('transactions')
            .select('*, lines:transaction_lines(*)')
            .eq('entity_id', entityId)
            .eq('status', 'POSTED')
            .order('transaction_date', { ascending: false })
            .limit(10);
        if (txnError) {
            throw new common_1.BadRequestException(txnError.message);
        }
        const { data: attachments, error: attachError } = await this.supabase
            .from('attachments')
            .select('*')
            .eq('entity_id', entityId)
            .order('uploaded_at', { ascending: false });
        if (attachError) {
            throw new common_1.BadRequestException(attachError.message);
        }
        return {
            entity,
            balance,
            recent_transactions: recentTransactions || [],
            attachments: attachments || [],
        };
    }
    async searchEntitiesByPhone(phone, tenantId) {
        const { data, error } = await this.supabase.rpc('search_entities_by_phone', {
            p_phone: phone,
            p_tenant_id: tenantId,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data || [];
    }
    async addLinkedPhone(entityId, phone) {
        const { data: entity, error: fetchError } = await this.supabase
            .from('entities')
            .select('linked_phones')
            .eq('id', entityId)
            .single();
        if (fetchError || !entity) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const currentPhones = entity.linked_phones || [];
        if (currentPhones.includes(phone)) {
            throw new common_1.BadRequestException('Phone number already linked to this entity');
        }
        const { data, error } = await this.supabase
            .from('entities')
            .update({
            linked_phones: [...currentPhones, phone],
        })
            .eq('id', entityId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async removeLinkedPhone(entityId, phone) {
        const { data: entity, error: fetchError } = await this.supabase
            .from('entities')
            .select('linked_phones')
            .eq('id', entityId)
            .single();
        if (fetchError || !entity) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const currentPhones = entity.linked_phones || [];
        const updatedPhones = currentPhones.filter((p) => p !== phone);
        const { data, error } = await this.supabase
            .from('entities')
            .update({
            linked_phones: updatedPhones,
        })
            .eq('id', entityId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_CLIENT)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map