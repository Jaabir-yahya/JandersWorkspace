# User Flows and Management

This guide describes common user flows and how to manage tenants (including the dev tenant for innovating).

---

## Common User Flows

### 1. Sign in and workspace selection

1. User goes to **Login** (`/login`), enters email and password (Supabase Auth).
2. After successful sign-in:
   - If the user has a tenant in their profile (Supabase `user_metadata.tenant_id`), they are sent to **Dashboard** and that tenant is set as the current workspace.
   - If the user has no tenant in profile, they are sent to **Tenant selection** (`/tenant-select`).
3. On **Tenant selection**, the app loads workspaces the user can access (`GET /api/v1/tenants/my-tenants`). The user picks one; the app stores the selected tenant ID and name in `localStorage` and redirects to **Dashboard**.

### 2. Switching workspace

- **Header**: Click the workspace name in the header to open the tenant switcher. Choose another workspace; the app updates the current tenant and refreshes.
- **Settings**: Under **Workspace**, use **Switch workspace** to go to `/tenant-select` and pick a different tenant.

### 3. App routes and tenant context

- **Dashboard**, **Inventory**, **Supplies**, **Invoices**, **Reports**, **Ledger**, and **Settings** require:
  - A valid auth token (otherwise redirect to `/login`).
  - A current tenant (otherwise redirect to `/tenant-select`).
- The API client sends:
  - `Authorization: Bearer <token>`
  - `X-Tenant-Id: <current_tenant_id>` on every request.
- Query params like `tenant_id` are also sent where the API expects them (e.g. dashboard stats, transactions list). The API resolves the effective tenant from JWT, `X-Tenant-Id`, and the user’s allowed tenants (see below).

### 4. Management (admin)

- **Create tenant**: Only users with `role === 'admin'` can call `POST /api/v1/tenants` (name, slug, phoneNumber, displayName, email). This creates a BASIC tenant and an admin user for that tenant.
- **List tenants**: `GET /api/v1/tenants` (all active) or `GET /api/v1/tenants/my-tenants` (tenants the current user can access).
- **Set tenant API key**: Admins can call `PATCH /api/v1/tenants/:id/api-key` to set an API key for a tenant (e.g. for headless or mobile access).

---

## API tenant resolution

- The backend allows a tenant to be specified by:
  - JWT `user_metadata.tenant_id`, or
  - `X-Tenant-Id` header / `tenant_id` query, **only if** that tenant is in the user’s allowed list (users linked by email in the `users` table).
- Dashboard and transactions controllers use `TenantsService.resolveEffectiveTenantId()` so that:
  - If the user has a tenant in JWT and the request tenant matches, it’s allowed.
  - If the user has no tenant in JWT (or wants to switch), the requested tenant is allowed only when the user has a `User` record for that tenant (same email).

---

## Dev tenant for innovating

A **dev** tenant is intended for local development and trying new features without touching production data.

### Create the dev tenant

From the repo root, ensure `DATABASE_URL` is set (e.g. in `.env` or `packages/database/.env`). Then run:

```bash
node scripts/setup-dev-tenant.js
```

If Prisma client is not available at root (monorepo), run from the database package:

```bash
cd packages/database && node ../../scripts/setup-dev-tenant.js
```

Optional: link the dev tenant to your Supabase account so it appears under “my tenants”:

```bash
node scripts/setup-dev-tenant.js --email=your@email.com
```

This creates or updates:

- A tenant with **slug** `dev` and **name** “Dev Workspace”, tier BASIC, with features suitable for experimentation.
- Optionally a `User` record for that email in the dev tenant so `GET /tenants/my-tenants` returns the dev tenant.

### Using the dev tenant

1. Run the script (with `--email` if you want it linked to your account).
2. Sign in to the app with your Supabase credentials.
3. If you are sent to **Tenant selection**, choose **Dev Workspace** (slug `dev`).
4. If your Supabase user already has `user_metadata.tenant_id` set to the dev tenant UUID, you’ll land on the dashboard with the dev tenant selected.
5. Use the header tenant switcher anytime to switch to or from the dev tenant (if you have access to multiple workspaces).

---

## Summary

| Flow              | Entry point      | Result                                      |
|-------------------|------------------|---------------------------------------------|
| Sign in (has tenant) | `/login`         | Dashboard with that tenant                  |
| Sign in (no tenant)   | `/login`         | Tenant selection → pick workspace → Dashboard |
| Switch workspace     | Header or Settings | Current tenant updated, page refreshed    |
| Dev tenant        | `scripts/setup-dev-tenant.js` | Tenant `dev` created; optional link to your email |
