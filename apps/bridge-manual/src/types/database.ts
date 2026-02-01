// Basic types for Supabase tables
export interface User {
  id: string;
  tenant_id: string;
  phone_number: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
  metadata: any;
  created_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  entity_id: string | null;
  reference: string;
  status: string;
  type: string;
  payment_status: string;
  total_amount: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
  created_by_user_id: string;
  reversed_transaction_id: string | null;
  metadata: any;
}

export interface Entity {
  id: string;
  tenant_id: string;
  type: string;
  display_name: string;
  phone_number: string | null;
  metadata: any;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  reference: string | null;
  amount: number;
  currency_code: string;
  status: string;
  metadata: any;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}
