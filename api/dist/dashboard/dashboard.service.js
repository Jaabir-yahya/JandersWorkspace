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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../supabase/supabase.module");
let DashboardService = class DashboardService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getDashboardStats(tenantId) {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const { data: todayRevenue, error: todayError } = await this.supabase
            .from('transactions')
            .select('total_amount')
            .eq('tenant_id', tenantId)
            .eq('status', 'POSTED')
            .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
            .gte('transaction_date', startOfToday.toISOString());
        if (todayError) {
            throw new common_1.BadRequestException(todayError.message);
        }
        const { data: weekRevenue, error: weekError } = await this.supabase
            .from('transactions')
            .select('total_amount')
            .eq('tenant_id', tenantId)
            .eq('status', 'POSTED')
            .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
            .gte('transaction_date', startOfWeek.toISOString());
        if (weekError) {
            throw new common_1.BadRequestException(weekError.message);
        }
        const { data: monthRevenue, error: monthError } = await this.supabase
            .from('transactions')
            .select('total_amount')
            .eq('tenant_id', tenantId)
            .eq('status', 'POSTED')
            .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
            .gte('transaction_date', startOfMonth.toISOString());
        if (monthError) {
            throw new common_1.BadRequestException(monthError.message);
        }
        const { count: todayCount, error: todayCountError } = await this.supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('status', 'POSTED')
            .gte('transaction_date', startOfToday.toISOString());
        if (todayCountError) {
            throw new common_1.BadRequestException(todayCountError.message);
        }
        const { count: weekCount, error: weekCountError } = await this.supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('status', 'POSTED')
            .gte('transaction_date', startOfWeek.toISOString());
        if (weekCountError) {
            throw new common_1.BadRequestException(weekCountError.message);
        }
        const { data: creditData, error: creditError } = await this.supabase
            .from('transactions')
            .select('total_amount')
            .eq('tenant_id', tenantId)
            .eq('status', 'POSTED')
            .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
            .eq('is_credit', true);
        if (creditError) {
            throw new common_1.BadRequestException(creditError.message);
        }
        const { data: debtData, error: debtError } = await this.supabase
            .from('transactions')
            .select('total_amount')
            .eq('tenant_id', tenantId)
            .eq('status', 'POSTED')
            .eq('type', 'PROCUREMENT')
            .eq('is_credit', true);
        if (debtError) {
            throw new common_1.BadRequestException(debtError.message);
        }
        const { data: paymentData, error: paymentError } = await this.supabase
            .from('payment_records')
            .select('method, amount, transactions!inner(tenant_id)')
            .eq('transactions.tenant_id', tenantId);
        if (paymentError) {
            throw new common_1.BadRequestException(paymentError.message);
        }
        const { data: topCustomers, error: topCustomersError } = await this.supabase.rpc('get_top_customers', { p_tenant_id: tenantId, p_limit: 5 });
        if (topCustomersError) {
            console.warn('get_top_customers function not found:', topCustomersError.message);
        }
        const { data: recentActivity, error: activityError } = await this.supabase
            .from('transactions')
            .select('id, type, total_amount, transaction_date, reference, entities:entity_id(display_name)')
            .eq('tenant_id', tenantId)
            .order('transaction_date', { ascending: false })
            .limit(10);
        if (activityError) {
            throw new common_1.BadRequestException(activityError.message);
        }
        const paymentBreakdown = { cash: 0, mpesa: 0, bank: 0, credit: 0 };
        (paymentData || []).forEach((payment) => {
            const method = payment.method?.toLowerCase();
            if (method === 'cash')
                paymentBreakdown.cash += payment.amount;
            else if (method === 'm-pesa' || method === 'mpesa')
                paymentBreakdown.mpesa += payment.amount;
            else if (method === 'bank_transfer' || method === 'bank')
                paymentBreakdown.bank += payment.amount;
            else if (method === 'credit')
                paymentBreakdown.credit += payment.amount;
        });
        const formattedActivity = (recentActivity || []).map((txn) => ({
            id: txn.id,
            type: (txn.type === 'EXPENSE_RETURN' ? 'reversal' : 'transaction'),
            description: `${txn.type} - ${txn.entities?.display_name || 'Unknown'}${txn.reference ? ` (${txn.reference})` : ''}`,
            amount: txn.total_amount,
            timestamp: txn.transaction_date,
        }));
        return {
            total_revenue_today: (todayRevenue || []).reduce((sum, t) => sum + (t.total_amount || 0), 0),
            total_revenue_week: (weekRevenue || []).reduce((sum, t) => sum + (t.total_amount || 0), 0),
            total_revenue_month: (monthRevenue || []).reduce((sum, t) => sum + (t.total_amount || 0), 0),
            transactions_today: todayCount || 0,
            transactions_week: weekCount || 0,
            outstanding_credit: (creditData || []).reduce((sum, t) => sum + (t.total_amount || 0), 0),
            outstanding_debt: (debtData || []).reduce((sum, t) => sum + (t.total_amount || 0), 0),
            payment_method_breakdown: paymentBreakdown,
            top_customers: topCustomers || [],
            recent_activity: formattedActivity,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_CLIENT)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map