# Deployment Checklist for Project Bridge Phase 2

## Overview
This checklist guides you through deploying the Project Bridge API and connecting a frontend (v0.dev, ToolJet, or custom).

---

## Part 1: Local Development Setup (Ready Now)

### ✅ Completed
- [x] Phase 2 backend implementation complete
- [x] Database migrations created
- [x] Local Supabase database reset and migrated
- [x] API built and running locally
- [x] HTTP test files created

### Current Status
- **API Running:** `http://localhost:3000` (check Terminal 1)
- **Local Database:** `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Supabase Studio:** `http://127.0.0.1:54323`

---

## Part 2: Test API Locally

### Step 1: Verify API is Running
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### Step 2: Test with HTTP File
Open [`api/test/phase2-state-machine.http`](api/test/phase2-state-machine.http) in VS Code and run each request.

### Step 3: Verify Database
1. Open Supabase Studio: `http://127.0.0.1:54323`
2. Go to **Table Editor**
3. Verify tables exist:
   - `entities`
   - `transactions`
   - `transaction_lines`
   - `users`
   - `payments`
   - `payment_applications`

---

## Part 3: Deploy to Production

### Option A: Railway (Recommended)

#### Prerequisites
- [ ] Railway account (free tier available)
- [ ] GitHub repository connected to Railway

#### Steps

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   ```

2. **Deploy API**
   ```bash
   # Add PostgreSQL database
   railway add postgresql
   
   # Add NestJS app
   railway add
   
   # Set environment variables
   railway variables set SUPABASE_URL="your-supabase-url"
   railway variables set SUPABASE_ANON_KEY="your-anon-key"
   railway variables set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   railway variables set PORT=3000
   railway variables set NODE_ENV=production
   
   # Deploy
   railway up
   ```

3. **Get Deployment URL**
   ```bash
   railway domain
   ```

4. **Test Production API**
   ```bash
   curl https://your-app.railway.app/health
   ```

### Option B: Render

#### Prerequisites
- [ ] Render account (free tier available)
- [ ] GitHub repository

#### Steps

1. **Create PostgreSQL Database**
   - Go to [render.com](https://render.com)
   - Click **New** → **PostgreSQL**
   - Name: `project-bridge-db`
   - Save the **Internal Database URL**

2. **Create Web Service**
   - Click **New** → **Web Service**
   - Connect your GitHub repository
   - Root Directory: `api`
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`
   - Environment Variables:
     ```
     SUPABASE_URL=your-supabase-url
     SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     PORT=3000
     NODE_ENV=production
     ```
   - Click **Deploy Web Service**

3. **Get Deployment URL**
   - Copy the URL from Render dashboard

4. **Test Production API**
   ```bash
   curl https://your-app.onrender.com/health
   ```

---

## Part 4: Remote Database Setup

### Option A: Use Supabase Cloud (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click **New Project**
   - Name: `project-bridge`
   - Region: Choose closest to your users
   - Wait for project to be ready (~2 minutes)

2. **Get Connection Details**
   - Go to **Settings** → **Database**
   - Copy:
     - **Project URL** (SUPABASE_URL)
     - **anon public** key (SUPABASE_ANON_KEY)
     - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

3. **Push Migrations to Remote**
   ```bash
   # Link to remote project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

4. **Verify Remote Database**
   - Open Supabase Dashboard
   - Go to **Table Editor**
   - Verify all tables exist

### Option B: Use Railway/Render PostgreSQL

1. **Get Database URL**
   - From Railway/Render dashboard
   - Copy the **Internal Database URL**

2. **Update Environment Variables**
   - Replace `SUPABASE_URL` with database URL
   - Note: You'll need to adapt the Supabase client to use raw PostgreSQL

---

## Part 5: Frontend Options

### Option A: v0.dev (AI-Generated UI) ⭐ RECOMMENDED

#### Why v0.dev?
- **No coding required** - AI generates UI from prompts
- **Modern React components** - shadcn/ui based
- **Fast iteration** - Describe changes, get instant updates
- **Exportable** - Download as React project

#### Steps

1. **Go to v0.dev**
   - Visit [v0.dev](https://v0.dev)
   - Sign in with GitHub

2. **Create New Project**
   - Click **New Chat**
   - Use this prompt:

```
Create a Project Bridge Admin Dashboard with 3 pages:

Page 1: Transaction Feed
- Table showing: Date, Customer, Type, Amount, Status
- Filters: Date range, Status dropdown, Type dropdown
- Search bar for customer name, reference, SKU
- Click row to view details

Page 2: Create Transaction
- Form with: Customer dropdown, Type dropdown, Date picker, Reference input
- Dynamic line items table (add/remove rows)
- Each line: Description, Quantity, Unit Price, SKU, Account Code
- Total amount calculation
- Save as Draft button

Page 3: Transaction Manager
- Table showing DRAFT transactions
- Post button (changes DRAFT → POSTED)
- Reverse button with reason input
- Refresh button

Use shadcn/ui components with Tailwind CSS.
Connect to REST API at: http://localhost:3000/api/v1
Use modern, clean design with good contrast.
Make it mobile-responsive.
```

3. **Iterate on Design**
   - Ask for changes: "Make the table more compact"
   - Add features: "Add a dark mode toggle"
   - Fix issues: "The form validation isn't working"

4. **Export and Run Locally**
   - Click **Export** → **Download as ZIP**
   - Extract ZIP
   - Run:
     ```bash
     npm install
     npm run dev
     ```
   - Open `http://localhost:5173`

5. **Connect to API**
   - Update API base URL in code
   - Test all features

### Option B: ToolJet (No-Code Builder)

#### Why ToolJet?
- **Drag-and-drop** - Visual builder
- **API integration** - Easy REST API connection
- **Built-in components** - Tables, forms, charts
- **Multi-page apps** - Easy navigation

#### Steps

1. **Sign Up for ToolJet**
   - Go to [tooljet.com](https://tooljet.com)
   - Create free account

2. **Create REST API Data Source**
   - Go to **Data Sources**
   - Add **REST API**
   - Base URL: `http://localhost:3000` (or production URL)
   - Test connection

3. **Build Pages**
   - Follow [`docs/TOOLJET_SETUP_GUIDE.md`](docs/TOOLJET_SETUP_GUIDE.md)
   - Create 3 pages: Feed, Writer, Manager

4. **Test Workflow**
   - Create transaction → Post → Reverse
   - Verify all features work

### Option C: Custom React/Vue App

#### Steps

1. **Create Project**
   ```bash
   # React + Vite
   npm create vite@latest frontend -- --template react-ts
   
   # Or Vue
   npm create vue@latest frontend
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install axios react-router-dom
   # Or for Vue
   npm install axios vue-router
   ```

3. **Build UI**
   - Use component library (shadcn/ui, Element Plus, etc.)
   - Follow API documentation in [`docs/openapi.yaml`](docs/openapi.yaml)
   - Implement 3 pages

4. **Connect to API**
   ```typescript
   // Example API client
   import axios from 'axios';
   
   const api = axios.create({
     baseURL: 'http://localhost:3000/api/v1',
     headers: {
       'Content-Type': 'application/json',
     },
   });
   
   export default api;
   ```

---

## Part 6: Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `PORT` | API port | `3000` |
| `NODE_ENV` | Environment | `production` |

### Local Development (.env)
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
PORT=3000
NODE_ENV=development
```

### Production (Railway/Render)
Set these in the platform's environment variables section.

---

## Part 7: Testing Checklist

### API Tests
- [ ] Health check: `GET /health`
- [ ] Create transaction: `POST /transactions`
- [ ] List transactions: `GET /transactions`
- [ ] Post transaction: `POST /transactions/{id}/post`
- [ ] Reverse transaction: `POST /transactions/{id}/reverse`
- [ ] Update payment status: `PATCH /transactions/{id}/payment_status`
- [ ] Export transaction: `GET /transactions/{id}/export`
- [ ] Entity history: `GET /entities/{id}/history`

### Frontend Tests
- [ ] Create DRAFT transaction
- [ ] View transaction in list
- [ ] Post transaction (DRAFT → POSTED)
- [ ] Verify immutability (cannot edit POSTED)
- [ ] Reverse transaction
- [ ] Search by customer name
- [ ] Search by reference
- [ ] Search by SKU
- [ ] Filter by date range
- [ ] Filter by status
- [ ] Filter by type
- [ ] View entity history
- [ ] Export to Universal Invoice format

### Integration Tests
- [ ] Frontend creates transaction → Appears in database
- [ ] Frontend posts transaction → Status changes to POSTED
- [ ] Frontend reverses transaction → Reversal record created
- [ ] Search returns correct results
- [ ] Filters work correctly

---

## Part 8: Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
- Check SUPABASE_URL is correct
- Verify database is running
- Check firewall settings

### Issue: "Migration failed"
**Solution:**
- Reset local database: `supabase db reset`
- Check migration file syntax
- Verify migration order

### Issue: "API returns 404"
**Solution:**
- Check API is running: `curl http://localhost:3000/health`
- Verify route is correct
- Check CORS settings

### Issue: "Frontend cannot connect to API"
**Solution:**
- Check API base URL in frontend
- Verify CORS is enabled in API
- Check network tab in browser dev tools

### Issue: "Transaction cannot be posted"
**Solution:**
- Verify status is DRAFT
- Check all required fields are filled
- Verify user_id is valid

---

## Part 9: Next Steps After Deployment

1. **Add Authentication**
   - Implement JWT tokens
   - Add user login/registration
   - Protect API endpoints

2. **Add M-Pesa Integration**
   - Integrate M-Pesa API
   - Handle payment callbacks
   - Update payment status automatically

3. **Add Email Notifications**
   - Send invoices via email
   - Payment confirmations
   - Transaction alerts

4. **Add Reporting**
   - Generate PDF invoices
   - Create financial reports
   - Export to Excel/CSV

5. **Add Multi-Tenant Support**
   - Tenant isolation
   - Tenant-specific settings
   - Tenant billing

---

## Part 10: Quick Start Commands

### Local Development
```bash
# Start Supabase
supabase start

# Reset database
supabase db reset

# Start API
cd api
npm install
npm run build
npm run start

# Test API
curl http://localhost:3000/health
```

### Deployment
```bash
# Railway
railway login
railway init
railway add postgresql
railway add
railway up

# Render
# Use Render dashboard (no CLI needed)

# Supabase Remote
supabase link --project-ref your-ref
supabase db push
```

---

## Support & Resources

- **API Documentation:** [`docs/openapi.yaml`](docs/openapi.yaml)
- **Phase 2 Spec:** [`docs/PHASE_2_SPEC.md`](docs/PHASE_2_SPEC.md)
- **ToolJet Guide:** [`docs/TOOLJET_SETUP_GUIDE.md`](docs/TOOLJET_SETUP_GUIDE.md)
- **Goal Checklist:** [`docs/GOAL_CHECKLIST.md`](docs/GOAL_CHECKLIST.md)
- **HTTP Tests:** [`api/test/phase2-state-machine.http`](api/test/phase2-state-machine.http)

---

**Last Updated:** 2026-01-29
**Phase:** 2 - Visibility, Workflow & International Standardization
**Status:** Backend Complete, Ready for Deployment
