# Project Bridge: Perfect Frontend Design Document

## For African Informal Economy - Manual-First Use Case

---

## Executive Summary

**Current State:** Basic Next.js frontend with quick-add transactions, voice recording (English only), and offline storage.

**Gap:** The current frontend is a developer MVP, not a user-ready product. It lacks the UX sophistication needed for low-literacy, mobile-first African informal economy users.

**Goal:** Design and build the perfect frontend that serves dukas, vibandas, salons, mechanics, and farmers who:

- Have basic smartphones (Android, 2-3 years old)
- Use 2G/3G networks with intermittent connectivity
- Prefer Swahili/Sheng or simple English
- Are price-sensitive and time-constrained
- Need immediate value without learning curves

---

## User Personas

### 1. Mama Njoro - Shop Owner (Primary)

- **Age:** 35-50
- **Business:** Duka (small shop) in Nairobi
- **Tech:** Android phone, uses WhatsApp, M-Pesa daily
- **Pain Points:**
  - Forgets who owes her money (Udhaari)
  - Doesn't know daily profit/loss
  - Takes 2 hours to count stock manually
  - Can't prove income for loans
- **Goals:**
  - Track sales in under 10 seconds
  - Know daily profit at a glance
  - Remember credit customers
  - Get loan-ready records

### 2. Fundi Juma - Mechanic

- **Age:** 25-40
- **Business:** Motorcycle repair shop
- **Tech:** Smartphone, uses voice notes heavily
- **Pain Points:**
  - Can't read/write well
  - Forgets spare parts costs
  - Loses track of customer jobs
  - Cash flow is unpredictable
- **Goals:**
  - Voice-based transaction entry
  - Photo receipts for parts
  - Simple job tracking
  - Know if he made profit today

### 3. Mkulima Sarah - Farmer

- **Age:** 30-45
- **Business:** Vegetable farm + market sales
- **Tech:** Basic smartphone, patchy internet
- **Pain Points:**
  - No electricity at farm (battery concerns)
  - Poor network at market
  - Can't track which buyer owes money
  - Loses money to middlemen
- **Goals:**
  - Offline-first app
  - Voice input in Swahili
  - Photo proof of deliveries
  - Sync when back home with WiFi

---

## Core Constraints & Requirements

### 1. Technical Constraints

```typescript
interface TechnicalConstraints {
  // Device
  minAndroidVersion: 8; // Android 8.0 Oreo (2017+)
  minIosVersion: 12; // iOS 12 (2018+)
  minScreenSize: "5 inches";
  targetRam: "2GB";

  // Network
  minConnection: "2G (GPRS)"; // 50-100 kbps
  targetConnection: "3G"; // 1-4 Mbps
  offlineCapability: "24+ hours"; // Full functionality offline

  // Performance
  firstPaint: "< 3 seconds"; // On 3G
  timeToInteractive: "< 5 seconds";
  bundleSize: "< 500KB initial";

  // Battery
  backgroundSync: false; // Only foreground sync to save battery
  gpsUsage: "optional"; // Don't require GPS
  cameraUsage: "optional"; // Don't require camera
}
```

### 2. UX Constraints

```typescript
interface UXConstraints {
  // Literacy
  primaryLanguage: "swahili" | "sheng" | "simple_english";
  readingLevel: "primary_school"; // Grade 6-8 level
  voiceFirst: true; // Voice input prioritized

  // Interface
  minTouchTarget: 48; // 48x48dp minimum
  fontSize: "18sp minimum"; // Large fonts
  contrast: "high"; // High contrast for outdoor use

  // Cognitive Load
  maxClicksPerTask: 3; // Any task in 3 taps or less
  noTypingRequired: "optional"; // Voice/photo alternatives
  contextualHelp: "always_visible";
}
```

### 3. Business Constraints

```typescript
interface BusinessConstraints {
  pricing: {
    basicTier: "FREE";
    proTier: "$3-5/month"; // Affordable for informal sector
    paymentMethod: "M-Pesa";
  };

  onboarding: {
    maxTime: "5 minutes";
    noEmailRequired: true; // Phone number only
    noPasswordRequired: true; // OTP login
  };

  support: {
    channels: ["whatsapp", "sms", "in_app"];
    responseTime: "< 4 hours";
    languages: ["swahili", "english"];
  };
}
```

---

## Data Flow Architecture

### 1. Frontend State Management

```typescript
// Core State Architecture
interface AppState {
  // Offline-first data layer
  local: {
    transactions: OfflineTransaction[];
    customers: Customer[];
    inventory: InventoryItem[];
    settings: UserSettings;
    syncQueue: SyncAction[];
  };

  // Online state (ephemeral)
  online: {
    isConnected: boolean;
    connectionType: "2g" | "3g" | "4g" | "wifi" | "offline";
    pendingUploads: number;
    lastSync: Date;
  };

  // UI state
  ui: {
    currentScreen: Screen;
    activeCustomer?: Customer;
    draftTransaction?: DraftTransaction;
    notifications: Notification[];
  };
}
```

### 2. API Contracts (What Frontend Sends/Receives)

#### Public Endpoints (No JWT Required)

```typescript
// GET /api/v1/tenants/slug/:slug
interface TenantResolutionResponse {
  id: string;
  name: string;
  slug: string;
  country: "KE" | "TZ" | "UG" | "NG";
  currency: "KES" | "TZS" | "UGX" | "NGN";
  features: {
    manual_transactions: boolean;
    voice_input: boolean;
    photo_receipts: boolean;
    customer_management: boolean;
    inventory: boolean;
    mpesa: boolean;
    whatsapp: boolean;
  };
}

// GET /api/v1/dashboard/stats/public
// Headers: X-Tenant-Id: <tenant_id>
interface DashboardStatsResponse {
  today: {
    revenue: number;
    expenses: number;
    profit: number;
    transactionCount: number;
  };
  thisWeek: {
    revenue: number;
    comparison: number; // % vs last week
  };
  topCustomers: Array<{
    name: string;
    totalSpent: number;
    transactionCount: number;
  }>;
  alerts: Array<{
    type: "low_stock" | "credit_due" | "high_expense";
    message: string;
    severity: "info" | "warning" | "urgent";
  }>;
}

// GET /api/v1/transactions/list
// Headers: X-Tenant-Id: <tenant_id>
// Query: ?date_from=2025-02-01&date_to=2025-02-01&limit=50
interface TransactionListResponse {
  transactions: Array<{
    id: string;
    amount: number;
    type: "sale" | "expense" | "purchase";
    description: string;
    customerName?: string;
    paymentMethod: "cash" | "mpesa" | "credit" | "bank";
    timestamp: string;
    hasReceipt: boolean;
  }>;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
}

// POST /api/v1/transactions/quick-capture
// Headers: X-Tenant-Id: <tenant_id>
// Content-Type: application/json
interface QuickCaptureRequest {
  amount: number;
  description: string;
  type: "sale" | "expense" | "purchase";
  currency_code: string; // "KES"
  method: "cash" | "mpesa" | "credit" | "bank";
  customer_name?: string;
  customer_phone?: string;
  photo_receipt?: string; // base64 encoded image
  voice_note_url?: string; // URL to stored voice note
  location?: {
    // Optional GPS
    lat: number;
    lng: number;
  };
}

interface QuickCaptureResponse {
  success: boolean;
  transactionId: string;
  message: string; // Localized: "Sale recorded successfully!"
  balance: {
    cash: number;
    mpesa: number;
    credit: number;
  };
}

// POST /api/v1/customers/quick-add
// Headers: X-Tenant-Id: <tenant_id>
interface QuickCustomerRequest {
  name: string;
  phone?: string;
  photo?: string; // base64
  note?: string; // "Lives near school, pays on Fridays"
}

interface CustomerResponse {
  id: string;
  name: string;
  phone?: string;
  photoUrl?: string;
  totalSpent: number;
  creditBalance: number;
  lastTransaction: Date;
}
```

#### Offline Sync Contract

```typescript
// Frontend stores actions locally, syncs in batches
interface SyncAction {
  id: string; // UUID generated locally
  type: "create_transaction" | "create_customer" | "update_inventory";
  payload: any;
  timestamp: number; // Unix timestamp
  retryCount: number;
  status: "pending" | "syncing" | "synced" | "failed";
  error?: string;
}

// Sync Process
// 1. User performs action offline
// 2. Action stored in IndexedDB with 'pending' status
// 3. When online, app batches pending actions
// 4. POST /api/v1/sync/batch with array of actions
// 5. Server processes, returns results
// 6. Frontend updates status, removes synced actions

// POST /api/v1/sync/batch
interface BatchSyncRequest {
  actions: SyncAction[];
  deviceId: string; // For deduplication
  lastSyncTimestamp: number;
}

interface BatchSyncResponse {
  results: Array<{
    actionId: string;
    success: boolean;
    serverId?: string; // ID assigned by server
    error?: string;
  }>;
  conflicts: Array<{
    actionId: string;
    serverVersion: any;
    resolution: "server_wins" | "client_wins" | "manual";
  }>;
  serverTime: number; // For next sync reference
}
```

---

## Perfect Frontend Screens

### 1. Home Dashboard (The "Daily Pulse")

```typescript
interface HomeScreen {
  // Primary View - Biggest Numbers
  todaySummary: {
    revenue: { amount: number; change: number }; // "+2,450 KES ↑12%"
    expenses: { amount: number; change: number }; // "-450 KES ↓5%"
    profit: { amount: number; status: "good" | "bad" };
  };

  // Visual Indicators
  cashFlow: {
    cash: number; // Physical cash in hand
    mpesa: number; // M-Pesa balance (manual entry)
    credit: number; // Money owed to business
  };

  // Quick Actions (Big Buttons)
  actions: [
    { icon: "plus"; label: "Add Sale"; color: "green"; shortcut: true },
    { icon: "minus"; label: "Add Expense"; color: "red" },
    { icon: "people"; label: "Customers" },
    { icon: "box"; label: "Stock" },
  ];

  // Recent Activity (Last 5)
  recent: TransactionPreview[];

  // Smart Alerts
  alerts: Array<{
    icon: string;
    message: string;
    action?: string;
  }>;
}
```

**Design Notes:**

- Full-screen, no scrolling required for core info
- Revenue in **HUGE** green text (primary focus)
- Profit indicator: 😊 / 😐 / 😟 face icons
- One-tap action buttons (minimum 64x64dp)
- Swipe left/right to see yesterday/tomorrow

### 2. Add Transaction (The "Magic Button")

```typescript
interface AddTransactionScreen {
  // Mode Selection (Voice is default!)
  modes: ["voice", "photo", "quick", "full"];

  // Voice Mode (Default)
  voiceCapture: {
    isRecording: boolean;
    transcript: string;
    confidence: number;
    language: "swahili" | "sheng" | "english";
    // Example: "Nimeuza mchele kilo mbili shilingi mia"
    // Parsed: { item: "rice", qty: 2, unit: "kg", amount: 100 }
  };

  // Photo Mode
  photoCapture: {
    cameraActive: boolean;
    capturedImage?: string;
    ocrProcessing: boolean;
    extractedData?: {
      amount?: number;
      items?: string[];
      vendor?: string;
    };
  };

  // Quick Mode (3-tap entry)
  quickForm: {
    type: "sale" | "expense";
    amount: string; // Big numeric keypad
    category: string; // Auto-suggest based on history
    customer?: string; // Searchable dropdown
  };

  // Confirmation
  review: {
    data: ParsedTransaction;
    editable: boolean;
    suggestions: string[]; // "Did you mean...?"
  };
}
```

**Design Notes:**

- Voice recording is the **default** mode
- Large circular record button (80dp)
- Real-time transcript display
- Suggestions based on history: "Rice - 150 KES?" "To John?"
- One-tap confirm or swipe to edit

### 3. Customer Management (The "Memory Book")

```typescript
interface CustomersScreen {
  // Quick Search
  search: {
    query: string;
    results: CustomerPreview[];
    addNewButton: true;
  };

  // Customer List
  customers: Array<{
    id: string;
    photo?: string;
    name: string;
    phone?: string;
    creditBalance: number; // Prominent if > 0
    totalSpent: number;
    lastVisit: string; // "2 days ago"
    tags: string[]; // ["regular", "credit", "wholesale"]
  }>;

  // Customer Detail
  customerDetail: {
    profile: Customer;
    stats: {
      totalTransactions: number;
      totalSpent: number;
      creditHistory: CreditRecord[];
      purchasePattern: "daily" | "weekly" | "monthly";
    };
    quickActions: ["call", "whatsapp", "add_sale", "add_credit"];
    notes: string[]; // "Prefers mornings", "Has 3 kids"
  };
}
```

**Design Notes:**

- Photo-first customer cards
- Credit balance in **red** if they owe money
- One-tap call/WhatsApp
- Voice notes for each customer
- Purchase pattern insights: "Buys every Tuesday"

### 4. Inventory/Stock (The "Shelf Tracker")

```typescript
interface InventoryScreen {
  // Stock Overview
  summary: {
    totalItems: number;
    lowStock: number; // Items below threshold
    outOfStock: number;
    stockValue: number; // Total value of inventory
  };

  // Item List
  items: Array<{
    id: string;
    photo?: string;
    name: string;
    currentStock: number;
    unit: string; // "kg", "pieces", "packets"
    reorderLevel: number;
    avgCostPrice: number;
    avgSellingPrice: number;
    profitMargin: number;
    status: "ok" | "low" | "out";
  }>;

  // Quick Stock Update
  stockIn: {
    item: InventoryItem;
    quantity: number;
    costPrice: number;
    supplier?: string;
    photo?: string; // Photo of delivery
  };

  stockOut: {
    item: InventoryItem;
    quantity: number;
    reason: "sale" | "damaged" | "personal_use";
  };
}
```

**Design Notes:**

- Color-coded stock levels (green/yellow/red)
- Photo of each item for easy identification
- Barcode scanner (optional)
- Low stock alerts: "Rice running low!"
- Profit margin calculator per item

### 5. Daily Summary Report (The "Business Story")

```typescript
interface DailyReportScreen {
  // Date Selector
  date: Date;
  comparison: "yesterday" | "last_week" | "custom";

  // Summary Cards
  summary: {
    revenue: { amount: number; breakdown: PaymentMethod[] };
    expenses: { amount: number; breakdown: Category[] };
    profit: number;
    profitMargin: number;
  };

  // Top Performers
  topSelling: Array<{
    item: string;
    quantity: number;
    revenue: number;
  }>;

  topCustomers: Array<{
    name: string;
    spent: number;
    transactions: number;
  }>;

  // Visual Charts (Simple)
  hourlySales: Array<{ hour: number; amount: number }>;

  // Share Options
  share: {
    pdf: boolean;
    excel: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
}
```

**Design Notes:**

- Simple bar charts (no complex graphs)
- Share via WhatsApp as image
- Voice summary: "Today you made 2,450 shillings profit"
- Comparison badges: "+12% vs yesterday"

---

## API Data Requirements (What Backend Must Provide)

### 1. Real-time Stats (Cached, Refresh Every 30s)

```typescript
// GET /api/v1/stats/realtime
interface RealtimeStats {
  today: DailySummary;
  thisWeek: WeeklySummary;
  alerts: Alert[];
  syncStatus: {
    pendingUploads: number;
    lastSync: Date;
    isSyncing: boolean;
  };
}
```

### 2. Smart Suggestions (ML-powered)

```typescript
// GET /api/v1/suggestions
interface SuggestionsResponse {
  // Auto-complete for transaction entry
  transaction: {
    frequentItems: string[]; // ["Rice", "Sugar", "Cooking Oil"]
    frequentCustomers: string[]; // ["John", "Mary School"]
    frequentAmounts: number[]; // [100, 200, 500, 1000]
  };

  // Smart alerts
  insights: Array<{
    type: "trend" | "anomaly" | "opportunity";
    message: string; // "You sell more on Saturdays"
    action?: string; // "Stock up on rice"
  }>;

  // Inventory predictions
  inventory: {
    likelyToRunOut: string[]; // ["Sugar - 2 days"]
    overStocked: string[]; // ["Cooking Oil - 3 weeks"]
  };
}
```

### 3. Voice Processing (Async)

```typescript
// POST /api/v1/voice/process
interface VoiceProcessRequest {
  audioBlob: string; // Base64 encoded audio
  language: "swahili" | "sheng" | "english";
  context?: string; // "add_sale", "add_expense"
}

interface VoiceProcessResponse {
  transcript: string;
  confidence: number;
  parsed: {
    type?: "sale" | "expense";
    amount?: number;
    items?: string[];
    customer?: string;
    paymentMethod?: string;
  };
  needsClarification: boolean;
  clarificationQuestions?: string[];
}
```

---

## Recommended Tech Stack Options

Since you want to try different tools, here are the options ranked by fit:

### Option A: React + Vite + PWA (RECOMMENDED)

**Why:** Maximum control, best PWA support, smallest bundle

```json
{
  "framework": "React 18",
  "bundler": "Vite",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "Zustand + TanStack Query",
  "pwa": "Vite PWA Plugin",
  "offline": "idb-keyval (IndexedDB)",
  "voice": "Web Speech API + Whisper API",
  "camera": "react-camera-pro",
  "charts": "Recharts (lightweight)"
}
```

**Pros:**

- Vite = instant dev, optimized builds
- Full PWA capability (service workers, background sync)
- Smallest bundle size
- Best offline support

**Cons:**

- More manual setup than Next.js
- No SSR (but we don't need it)

---

### Option B: Next.js 14 + App Router (Current Stack, Improved)

**Why:** Keep current stack but optimize heavily

```json
{
  "framework": "Next.js 14 (static export)",
  "styling": "Tailwind CSS",
  "state": "SWR + localStorage",
  "pwa": "next-pwa",
  "offline": "localForage"
}
```

**Optimization Strategy:**

1. Static export only (no SSR)
2. Route preloading for instant navigation
3. Aggressive code splitting
4. Image optimization for receipts

---

### Option C: React Native + Expo (Mobile-First)

**Why:** True native app feel, best camera/voice integration

```json
{
  "framework": "Expo SDK 50",
  "navigation": "Expo Router",
  "state": "Zustand",
  "offline": "WatermelonDB",
  "voice": "Expo Speech + Whisper",
  "camera": "Expo Camera",
  "notifications": "Expo Notifications"
}
```

**Pros:**

- Best performance on low-end devices
- Native camera/voice access
- Push notifications
- Can build for iOS too

**Cons:**

- Requires app store approval
- Separate codebase from web
- More complex deployment

---

### Option D: Vue 3 + Nuxt (Fresh Perspective)

**Why:** Different paradigm, excellent DX

```json
{
  "framework": "Vue 3 + Nuxt 3",
  "styling": "Tailwind CSS",
  "state": "Pinia",
  "pwa": "@vite-pwa/nuxt",
  "offline": "localforage"
}
```

---

## Implementation Priority

### Phase 1: Core Foundation (Week 1)

1. Setup new project with chosen stack
2. Implement offline-first data layer
3. Build PWA shell with service worker
4. Create tenant resolution flow

### Phase 2: Essential Screens (Week 2)

1. Home dashboard with daily summary
2. Quick transaction entry (voice + manual)
3. Customer management
4. Offline sync mechanism

### Phase 3: Polish & Intelligence (Week 3)

1. Photo receipt capture
2. Smart suggestions
3. Inventory tracking
4. Daily reports

### Phase 4: Advanced (Week 4)

1. Swahili/Sheng voice support
2. WhatsApp integration
3. Advanced analytics
4. SMS notifications

---

## Success Metrics

```typescript
interface FrontendSuccessMetrics {
  // Performance
  loadTime: "< 3s on 3G";
  bundleSize: "< 500KB";

  // UX
  taskCompletion: "> 90%"; // Users complete transactions
  errorRate: "< 5%"; // Failed transactions
  offlineUsage: "> 30%"; // Actions taken offline

  // Business
  dailyActiveUsers: "> 60%"; // Of registered users
  transactionsPerUser: "> 3/day";
  retention30d: "> 40%";

  // Satisfaction
  nps: "> 50"; // Net Promoter Score
  supportTickets: "< 5%"; // Of users need help
}
```

---

## File Structure (Recommended)

```
apps/bridge-perfect/                 # New frontend
├── src/
│   ├── app/                        # Router (if Next.js/Vue)
│   │   ├── page.tsx                # Home/Dashboard
│   │   ├── add/                    # Add transaction
│   │   ├── customers/              # Customer management
│   │   ├── inventory/              # Stock tracking
│   │   ├── reports/                # Daily summaries
│   │   └── settings/               # App settings
│   │
│   ├── components/                 # Reusable components
│   │   ├── ui/                     # Base UI (shadcn)
│   │   ├── layout/                 # App shell
│   │   │   ├── BottomNav.tsx       # Mobile navigation
│   │   │   ├── Header.tsx          # Top header
│   │   │   └── SyncStatus.tsx      # Offline indicator
│   │   ├── transactions/           # Transaction components
│   │   │   ├── VoiceCapture.tsx    # Voice recording
│   │   │   ├── PhotoCapture.tsx    # Camera/receipt
│   │   │   ├── QuickAdd.tsx        # Fast form
│   │   │   └── TransactionCard.tsx # List item
│   │   ├── customers/              # Customer components
│   │   ├── dashboard/              # Dashboard widgets
│   │   └── common/                 # Shared components
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useOffline.ts           # Offline detection
│   │   ├── useSync.ts              # Background sync
│   │   ├── useVoice.ts             # Voice recording
│   │   ├── useTenant.ts            # Tenant context
│   │   └── useStorage.ts           # Local storage
│   │
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # API client
│   │   ├── db.ts                   # IndexedDB wrapper
│   │   ├── sync.ts                 # Sync engine
│   │   ├── voice.ts                // Voice processing
│   │   └── i18n.ts                 // Swahili translations
│   │
│   ├── stores/                     # State management
│   │   ├── useAppStore.ts          // Main store (Zustand)
│   │   ├── useTransactionStore.ts
│   │   └── useCustomerStore.ts
│   │
│   ├── types/                      // TypeScript types
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── models.ts
│   │
│   └── workers/                    // Service workers
│       └── sync.worker.ts          // Background sync
│
├── public/                         // Static assets
│   ├── manifest.json               // PWA manifest
│   ├── sw.js                       // Service worker
│   └── icons/                      // App icons
│
├── tests/                          // Test suite
├── docs/                           // Documentation
└── package.json
```

---

## Conclusion

This design document outlines the **perfect** frontend for African informal economy users. The key principles are:

1. **Offline-First:** Works without internet, syncs when available
2. **Voice-First:** Voice input is primary, typing is secondary
3. **Mobile-Only:** Designed exclusively for smartphones
4. **Instant Value:** 5-minute onboarding, immediate usefulness
5. **Culturally Fit:** Swahili/Sheng support, local payment methods
6. **Low-Tech Friendly:** Big buttons, simple flows, no jargon

**Recommendation:** Use **React + Vite + PWA** for maximum control, smallest bundle, and best offline support. This is the optimal choice for your target market.

Ready to implement? Let's build this! 🚀
