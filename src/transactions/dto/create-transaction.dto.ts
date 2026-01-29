export class CreateTransactionDto {
  reference?: string;
  entity_id?: string;
  type: 'RETAIL'|'SERVICE'|'RENTAL'|'EXPENSE';
  currency_code?: string;
  metadata?: Record<string, any>;
  lines: {
    description?: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    account_code: string;
    metadata?: Record<string, any>;
  }[];
}
