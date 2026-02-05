# African Business Platform - Frontend

A **manual-first** accounting and inventory management platform designed specifically for African businesses with offline support, local payment integration (M-Pesa), and optimized for low-bandwidth environments.

## 🎯 Design Philosophy

This platform inverts the typical SaaS approach by building:
```
Truth Engine → Consistent API → Adaptable UI
```

Instead of the common:
```
UI Features → Database
```

This ensures:
- **Data integrity is guaranteed** before fancy features
- **Future tenants** get customization without re-engineering
- **Manual or automated** workflows use the same engine
- **Proof and auditability** are built-in, not added later

## 🚀 Features

### Core Accounting
- **Double-entry bookkeeping** with automatic ledger generation
- **Atomic transaction manager** ensures data integrity
- **Real-time ledger preview** before transaction submission
- Multi-currency support (KES, USD, EUR, GBP, UGX, TZS, RWF)
- Comprehensive audit logging

### Inventory Management
- Stock tracking with low-stock alerts
- Multiple unit types (piece, kg, litre, box, carton, sack)
- Automatic COGS calculation
- Supplier management
- Stock movement history

### Invoicing & Payments
- Sales and purchase invoices
- Multiple payment methods (Cash, Bank Transfer, M-Pesa, Cheque)
- Aging reports for receivables and payables
- PDF export and printing support
- Payment reminders and overdue alerts

### Dashboard & Reporting
- Real-time KPIs and business metrics
- Profit & Loss statements
- Balance Sheet
- Cash Flow reports
- Aging analysis
- Excel/PDF export functionality

### African Context Optimizations
- **M-Pesa integration ready** (manual entry initially)
- **Offline-first architecture** with localStorage sync
- **Touch-optimized UI** (44x44px minimum targets)
- **High contrast design** for sunlight readability
- **Keyboard shortcuts** for power users
- **Multi-language ready** (English, Swahili placeholders)
- **Receipt attachment** support for documentation culture

## 📁 Project Structure

```
african-business-platform/
├── apps/
│   └── web/                    # Next.js frontend application
│       ├── src/
│       │   ├── app/           # App router pages
│       │   │   ├── dashboard/ # Dashboard with KPIs
│       │   │   ├── inventory/ # Inventory management
│       │   │   ├── invoices/  # Invoice management
│       │   │   ├── payments/  # Payment processing
│       │   │   ├── customers/ # Customer management
│       │   │   ├── suppliers/ # Supplier management
│       │   │   └── reports/   # Reporting & analytics
│       │   ├── components/
│       │   │   ├── ui/        # Base UI components
│       │   │   ├── forms/     # Form components
│       │   │   ├── layouts/   # Layout components
│       │   │   └── features/  # Feature-specific components
│       │   ├── lib/
│       │   │   ├── api-client.ts # API communication layer
│       │   │   └── utils.ts      # Utility functions
│       │   ├── hooks/         # Custom React hooks
│       │   ├── types/         # TypeScript type definitions
│       │   └── styles/        # Global styles
│       ├── public/            # Static assets
│       └── package.json
├── packages/
│   ├── ui/                    # Shared UI component library
│   ├── typescript-config/     # Shared TypeScript configs
│   └── eslint-config/         # Shared ESLint configs
├── turbo.json                 # Turborepo configuration
├── pnpm-workspace.yaml        # pnpm workspace config
└── package.json               # Root package.json
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Turbo (Turborepo)
- **Package Manager**: pnpm

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm 8+

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd african-business-platform
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Start development server**
```bash
# From root directory
pnpm dev

# Or specifically for web app
cd apps/web
pnpm dev
```

The application will be available at `http://localhost:3000`

## ⌨️ Keyboard Shortcuts

The platform is optimized for fast data entry with keyboard shortcuts:

- `Ctrl/Cmd + P` - New Purchase
- `Ctrl/Cmd + I` - New Invoice
- `Ctrl/Cmd + M` - Record Payment
- `Ctrl/Cmd + N` - Add Inventory Item
- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + S` - Save current form
- `Esc` - Close modal/form

## 🌍 Internationalization

The platform is designed to support multiple languages and regional settings:

### Supported Currencies
- KES (Kenyan Shilling) - Primary
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- UGX (Ugandan Shilling)
- TZS (Tanzanian Shilling)
- RWF (Rwandan Franc)

### Regional Features
- **East African phone formats** (254, 255, 256, 250)
- **M-Pesa integration** (manual entry ready, API integration pending)
- **Mobile money** support (Airtel Money, MTN Mobile Money)
- **VAT/Tax rates** configurable per tenant
- **Fiscal year** configuration

## 📱 Mobile Optimization

- **Touch-friendly** minimum 44x44px tap targets
- **Responsive design** works on all screen sizes
- **Progressive Web App** (PWA) ready
- **Offline support** with localStorage sync
- **Low bandwidth** optimized (lazy loading, image optimization)

## 🎨 Design System

### Colors
- **Primary**: Blue (#0284c7) - Actions, links, highlights
- **Success**: Green (#22c55e) - Positive states, payments received
- **Warning**: Orange (#f59e0b) - Low stock, pending actions
- **Danger**: Red (#ef4444) - Overdue, errors, deletions
- **Neutral**: Gray scale - General UI elements

### Typography
- **Font**: Inter (system fallback)
- **Base size**: 16px (improved mobile readability)
- **Line height**: 1.5 (improved readability)

### Components
All components follow:
- **High contrast** for outdoor/sunlight visibility
- **Clear visual hierarchy**
- **Touch-optimized spacing**
- **Loading states** for all async operations
- **Error handling** with user-friendly messages

## 🔌 API Integration

The frontend connects to a NestJS backend with the following endpoints:

### Authentication
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`

### Accounts & Ledger
- GET `/api/accounts`
- GET `/api/accounts/:id`
- POST `/api/accounts`
- GET `/api/ledger`

### Transactions
- GET `/api/transactions`
- POST `/api/transactions`
- PUT `/api/transactions/:id`
- POST `/api/transactions/:id/approve`

### Inventory
- GET `/api/inventory`
- POST `/api/inventory`
- PUT `/api/inventory/:id`
- POST `/api/inventory/:id/adjust`

### Invoices
- GET `/api/invoices`
- POST `/api/invoices`
- GET `/api/invoices/:id/pdf`

### Reports
- GET `/api/reports/profit-loss`
- GET `/api/reports/balance-sheet`
- GET `/api/reports/cash-flow`
- GET `/api/reports/aging/:type`

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 🏗️ Building for Production

```bash
# Build all apps and packages
pnpm build

# Build only web app
cd apps/web
pnpm build

# Start production server
pnpm start
```

## 📊 Performance Optimizations

- **Code splitting** with Next.js automatic optimization
- **Image optimization** with Next.js Image component
- **Lazy loading** for heavy components
- **React Query caching** to minimize API calls
- **localStorage** for offline data persistence
- **Debounced search** to reduce API load
- **Virtual scrolling** for large lists (planned)

## 🔐 Security Features

- **JWT authentication**
- **Role-based access control** (RBAC)
- **Audit logging** for all transactions
- **Input validation** with Zod schemas
- **XSS protection** with React sanitization
- **CSRF protection** (backend)
- **Rate limiting** (backend)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
cd apps/web
vercel
```

### Docker
```bash
# Build Docker image
docker build -t african-business-platform .

# Run container
docker run -p 3000:3000 african-business-platform
```

### Traditional VPS
```bash
# Build application
pnpm build

# Serve with PM2
pm2 start npm --name "business-platform" -- start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Designed for African SMEs and entrepreneurs
- Built with feedback from Nairobi business owners
- Inspired by local accounting practices and needs

## 📞 Support

For support, email support@yourdomain.com or join our Slack channel.

## 🗺️ Roadmap

### Phase 1 (MVP) - Current
- [x] Core accounting engine
- [x] Manual data entry forms
- [x] Basic inventory management
- [x] Invoice generation
- [x] Payment recording
- [x] Dashboard with KPIs

### Phase 2 (Q2 2024)
- [ ] M-Pesa API integration
- [ ] Mobile app (React Native)
- [ ] Offline sync mechanism
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] Receipt OCR scanning

### Phase 3 (Q3 2024)
- [ ] Bank feed integration
- [ ] Payroll management
- [ ] Tax filing assistance
- [ ] Supplier portal
- [ ] Customer portal
- [ ] API for third-party integrations

### Phase 4 (Q4 2024)
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Automated reconciliation
- [ ] Multi-country expansion
- [ ] Franchise management
- [ ] Supply chain visibility

---

**Built with ❤️ for African businesses**
