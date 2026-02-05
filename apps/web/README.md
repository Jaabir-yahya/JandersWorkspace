# LedgerFlow - Manual-First Business Management System

A modern, production-ready frontend for double-entry accounting and business management, optimized for African businesses with emphasis on manual data entry, offline resilience, and real-time ledger previews.

## 🌍 Built for African Business Context

### Key Features

#### 1. **Manual-First Design**
- Keyboard-optimized forms (Ctrl+N, Ctrl+I, Ctrl+P shortcuts)
- Real-time ledger previews before submission
- Fast data entry with smart defaults
- Inline validation and error prevention

#### 2. **African Payment Methods**
- **MPesa Integration** - First-class support with transaction code validation
- **Multi-Currency** - KES, USD, EUR, GBP support
- **Cash Tracking** - Robust cash transaction management
- **Bank Transfers** - Local and international

#### 3. **Offline Resilience**
- Automatic detection of network status
- Offline queue for pending transactions
- Visual indicators for sync status
- Auto-sync when connection restored

#### 4. **Double-Entry Accounting**
- Real-time ledger preview on every form
- Automatic debit/credit calculation
- Balance validation before submission
- Audit trail for all transactions

## 🎨 Design Philosophy

### Visual Identity
- **Earthy, Trustworthy Palette** - Inspired by African landscapes (Savanna, Baobab, Acacia, Clay colors)
- **Professional Typography** - Epilogue for headings, Inter for body, JetBrains Mono for numbers
- **Smooth Animations** - Staggered reveals, hover states, micro-interactions
- **Grid Pattern Background** - Subtle texture adds depth without distraction

### UX Principles
1. **Speed** - Every form optimized for fast keyboard entry
2. **Clarity** - Ledger preview shows exactly what will happen
3. **Trust** - Professional design builds confidence
4. **Context** - Features designed for spotty internet, cash economy, MPesa

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- (Optional) Backend API endpoint

### Installation

```bash
# Clone the repository
cd ledger-system-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
ledger-system-frontend/
├── app/
│   ├── dashboard/          # KPI dashboard
│   │   └── page.tsx
│   ├── supplies/           # Inventory purchases
│   │   └── page.tsx
│   ├── invoices/           # Customer invoicing
│   │   └── page.tsx
│   ├── reports/            # Transaction reports
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Home redirect
│   └── globals.css         # Custom styles
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Header.tsx          # Top header with search
│   └── LedgerPreview.tsx   # Accounting preview
├── lib/
│   ├── types.ts            # TypeScript definitions
│   ├── utils.ts            # Helper functions
│   └── store.ts            # Zustand state management
└── public/                 # Static assets
```

## 🎯 Key Pages & Features

### Dashboard (`/dashboard`)
- **Revenue, Expenses, Profit KPIs** with trend indicators
- **Cash Balance** - Real-time available funds
- **Receivables & Payables** - Customer/supplier balances
- **Inventory Value** - Stock value with low-stock alerts
- **Recent Activity Feed** - Latest transactions
- **Quick Actions** - Keyboard shortcuts to common tasks

### Supplies (`/supplies`)
- **Purchase Entry Form** with item-by-item breakdown
- **Supplier Selection** - Searchable dropdown
- **Payment Methods** - Cash, MPesa, Bank, On Account
- **MPesa Code Validation** - 10-character format check
- **Real-time Ledger Preview** - Shows debit/credit before save
- **Stock Updates** - Automatic inventory adjustments

### Invoices (`/invoices`)
- **Customer Invoice Creation**
- **Line Item Entry** - Description, quantity, unit price
- **Invoice Preview** - See exactly what customer receives
- **Ledger Impact** - Revenue recognition preview
- **Email Integration Ready** - Prepared for backend API

### Reports (`/reports`)
- **Transaction Ledger** - All entries with filtering
- **Date Range Filters** - Custom period selection
- **Type & Status Filters** - Purchases, invoices, payments
- **CSV Export** - Download for Excel/Google Sheets
- **PDF Export Ready** - Template prepared
- **Print-Optimized** - Clean print layout

## 💡 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New Purchase |
| `Ctrl+I` | New Invoice |
| `Ctrl+P` | Record Payment |
| `Ctrl+S` | Save Current Form |
| `Tab` | Navigate form fields |
| `/` | Focus search |

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:
- `savanna` - Primary background tones
- `baobab` - Text and borders
- `acacia` - Success/positive actions
- `clay` - Warnings/expenses

### Typography
Change fonts in `globals.css`:
```css
:root {
  --font-display: 'Your Display Font';
  --font-sans: 'Your Body Font';
  --font-mono: 'Your Monospace Font';
}
```

## 🔌 API Integration

The frontend is prepared for backend integration. Update these files:

### `/lib/api.ts` (Create this file)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function createPurchase(data: SupplyPurchaseForm) {
  const response = await fetch(`${API_URL}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Key Endpoints to Implement
- `POST /purchases` - Create purchase
- `POST /invoices` - Create invoice
- `POST /payments` - Record payment
- `GET /dashboard/kpis` - Fetch KPIs
- `GET /transactions` - List transactions
- `GET /accounts` - Chart of accounts

## 🌐 Offline Support

The app includes:
- **Network Status Detection** - Visual indicator
- **Offline Queue** - Stores pending actions
- **Auto-Sync** - Syncs when online
- **Local Storage** - Persists critical data

Powered by Zustand with persistence middleware.

## 📱 Mobile Responsiveness

All pages are fully responsive:
- **Mobile**: Single column, touch-optimized
- **Tablet**: Adapted layouts
- **Desktop**: Full multi-column layouts

## 🔒 Security Considerations

Before production deployment:
1. Add authentication (JWT, OAuth)
2. Implement role-based access control
3. Enable HTTPS only
4. Add CSRF protection
5. Sanitize all inputs
6. Implement rate limiting

## 🚧 Roadmap

### Phase 1 - MVP (Current)
- ✅ Dashboard with KPIs
- ✅ Supplies/Purchase entry
- ✅ Invoice generation
- ✅ Reports with export
- ✅ Offline support

### Phase 2 - Backend Integration
- [ ] Connect to NestJS backend
- [ ] Real-time data sync
- [ ] User authentication
- [ ] Multi-tenant support

### Phase 3 - Advanced Features
- [ ] Mobile app (React Native)
- [ ] Bank reconciliation
- [ ] Automated reminders
- [ ] Advanced reporting
- [ ] WhatsApp notifications

### Phase 4 - African Expansion
- [ ] Mobile money APIs (MPesa, Airtel Money)
- [ ] Multi-language support (Swahili, French)
- [ ] Regional tax compliance
- [ ] Currency conversion

## 🤝 Contributing

This is a proprietary project for African business internationalization. For questions or partnership opportunities, contact the development team.

## 📄 License

Proprietary - All rights reserved.

## 🙏 Acknowledgments

Built with:
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Utility-first CSS
- Zustand - State management
- Framer Motion - Animations
- date-fns - Date utilities
- Lucide React - Icons

---

**Built with ❤️ for African entrepreneurs ready to go global**
