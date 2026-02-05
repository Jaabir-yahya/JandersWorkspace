import { api } from '../api-client';

export interface TenantOption {
  id: string;
  name: string;
  slug: string;
  tier: string;
  country: string;
  createdAt: string;
  updatedAt?: string;
  features?: Record<string, boolean>;
}

export interface MyTenantsResponse {
  success: boolean;
  data: TenantOption[];
}

export const tenantsApi = {
  /** Get tenants the current user can access (for selection/switching). */
  myTenants: (): Promise<TenantOption[]> =>
    api.get<MyTenantsResponse>('/tenants/my-tenants').then((res) => {
      const body = res.data as MyTenantsResponse | undefined;
      const data = body?.data;
      return Array.isArray(data) ? data : [];
    }),
};
