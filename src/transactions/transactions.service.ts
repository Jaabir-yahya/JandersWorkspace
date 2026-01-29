import { Injectable, BadRequestException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class TransactionsService {
  async create(payload: any) {
    // Basic validation
    if (!payload || !payload.tenant_id) throw new BadRequestException('tenant_id is required');
    if (!Array.isArray(payload.lines) || payload.lines.length === 0) throw new BadRequestException('lines required');

    // Prepare lines: ensure numeric fields and metadata default
    const lines = payload.lines.map((l: any) => ({
      description: l.description || null,
      quantity: l.quantity,
      unit_price: l.unit_price,
      account_code: l.account_code || null,
      metadata: l.metadata || {}
    }));

    // Call DB function to create transaction atomically
    const { data, error } = await supabase.rpc('create_transaction', {
      p_tenant_id: payload.tenant_id,
      p_entity_id: payload.entity_id || null,
      p_txn_type: payload.type || 'RETAIL',
      p_currency_code: payload.currency_code || 'KES',
      p_lines: JSON.stringify(lines)
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Supabase returns an array of rows for RETURNS TABLE
    return data && data.length > 0 ? data[0] : null;
  }

  async list() {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async get(id: string) {
    const { data, error } = await supabase.from('transactions').select('*, transaction_lines(*)').eq('id', id).single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async reverse(id: string, body: any) {
    // Minimal reversal: fetch original txn, create mirror lines with negative amounts
    const orig = await this.get(id);
    if (!orig) throw new BadRequestException('original transaction not found');
    if (orig.status !== 'POSTED') throw new BadRequestException('only POSTED transactions can be reversed');

    const revLines = orig.transaction_lines.map((l: any) => ({
      description: l.description,
      quantity: l.quantity,
      unit_price: -Math.abs(l.unit_price),
      account_code: l.account_code,
      metadata: l.metadata || {}
    }));

    const reversalPayload = {
      tenant_id: orig.tenant_id,
      entity_id: orig.entity_id,
      type: orig.type,
      currency_code: orig.currency_code,
      lines: revLines
    };

    const reversal = await this.create(reversalPayload);

    // update original status to REVERSED
    await supabase.from('transactions').update({ status: 'REVERSED' }).eq('id', id);

    return reversal;
  }
}
