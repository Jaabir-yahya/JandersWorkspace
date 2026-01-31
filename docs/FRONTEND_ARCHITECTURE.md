# Frontend Architecture

This document describes the architecture of the Project Bridge Next.js 15 frontend application.

---

## Overview

The frontend is built with **Next.js 15** using the App Router pattern, optimized for the African market with mobile-first design and support for low-bandwidth connections (2G/3G).

### Key Characteristics

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript 5.x with strict mode
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: SWR for server state, React hooks for local state
- **Build Output**: Static export for CDN deployment

---

## App Router Structure

```
apps/web/app/                    # Next.js App Router
├── (optimized)/                 # Route group for optimized features
│   ├── layout.tsx               # Optimized layout with tenant provider
│   ├── page.tsx                 # Optimized dashboard entry
│   ├── loading.tsx              # Loading state
│   └── error.tsx                # Error boundary
├── dashboard/                   # Main dashboard page
│   └── page.tsx
├── webhooks/                    # Webhook monitoring
│   ├── page.tsx
│   ├── hooks/
│   │   └── use-webhooks.ts      # Webhook data fetching
│   └── components/
│       ├── webhook-list.tsx
│       ├── webhook-stats.tsx
│       └── webhook-detail.tsx
├── create/                      # Create transaction page
│   └── page.tsx
├── manager/                     # Transaction manager
│   └── page.tsx
├── people/                      # Entity/CRM page
│   └── page.tsx
├── proof/                       # Attachment gallery
│   └── page.tsx
├── layout.tsx                   # Root layout
├── page.tsx                     # Landing page
├── globals.css                  # Global styles
└── favicon.ico
```

### Route Groups

The `(optimized)` route group provides:
- Tenant configuration context
- Network-aware loading states
- Mobile-optimized navigation
- Minimal dependency loading for core features

---

## Pages and Their Purposes

### 1. Dashboard (`/dashboard`)

**Purpose**: Main business overview

**Features**:
- Real-time revenue statistics
- Outstanding credit/debt tracking
- Today's transaction summary
- Payment method breakdown
- Quick action buttons

**Data Fetching**:
```typescript
const { data: stats, isLoading } = useDashboardStats();
const { data: transactions } = useTransactions();
```

### 2. Webhooks (`/webhooks`)

**Purpose**: Real-time webhook monitoring dashboard

**Features**:
- List of webhook events with filtering
- Integration type filters (M-Pesa, WhatsApp, etc.)
- Status filters (success, failed, pending)
- Date range filtering
- Auto-refresh every 10 seconds
- Retry failed webhooks
- 24-hour activity charts
- Statistics cards

**Data Fetching**:
```typescript
const { events, stats, refresh, retryEvent } = useWebhooks(tenantId);
const { trend, eventsByHour } = useWebhookMonitor(tenantId);
```

### 3. Create (`/create`)

**Purpose**: Create new transactions

**Features**:
- Transaction form with validation
- Entity selection
- Payment method selection
- Line items management
- Attachment upload

### 4. Manager (`/manager`)

**Purpose**: Transaction management

**Features**:
- Transaction list with filters
- Post draft transactions
- Reverse posted transactions
- Bulk operations

### 5. People (`/people`)

**Purpose**: Entity (customer/supplier) management

**Features**:
- Entity list with search
- 360° view with transaction history
- Balance tracking
- Contact information

### 6. Proof (`/proof`)

**Purpose**: Attachment gallery

**Features**:
- File upload
- Image gallery
- Document preview
- Receipt management

---

## Component Structure

```
apps/web/components/
├── ui/                          # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── skeleton.tsx
│   ├── table.tsx
│   └── ... (40+ components)
├── dashboard-shell.tsx          # Main layout shell
├── optimized-shell.tsx          # Optimized layout for core features
├── error-boundary.tsx           # Error handling
├── loading.tsx                  # Loading states
├── feature-flag.tsx             # Feature flag component
├── status-badge.tsx             # Status indicators
├── theme-provider.tsx           # Theme context
└── theme-toggle.tsx             # Dark/light mode toggle
```

### shadcn/ui Components

All UI components are from shadcn/ui, built on Radix UI primitives:

| Component | Purpose |
|-----------|---------|
| `button` | Actions and navigation |
| `card` | Content containers |
| `dialog` | Modals and overlays |
| `input` | Form text inputs |
| `select` | Dropdown selections |
| `table` | Data display |
| `tabs` | Content organization |
| `toast` | Notifications |
| `skeleton` | Loading placeholders |

---

## Data Fetching Patterns

### SWR Hooks

We use SWR (stale-while-revalidate) for server state management:

```typescript
// lib/api-client.ts
import useSWR from 'swr';

export function useDashboardStats() {
  return useSWR(
    '/dashboard/stats',
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );
}

export function useTransactions(filters?: TransactionFilters) {
  const queryString = filters ? `?${new URLSearchParams(filters)}` : '';
  return useSWR(
    `/transactions${queryString}`,
    fetcher,
    {
      refreshInterval: 10000, // 10 seconds for webhooks
    }
  );
}
```

### API Client

```typescript
// lib/api-client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
```

### Custom Hooks

```typescript
// lib/hooks/use-tenant.tsx
export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

// lib/hooks/use-network.ts
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<'4g' | '3g' | '2g' | 'slow-2g'>('4g');
  
  useEffect(() => {
    // Monitor network status for adaptive loading
  }, []);
  
  return { isOnline, connectionType, isSlowConnection };
}
```

---

## Performance Optimizations

### 1. Static Export

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
};
```

Benefits:
- Deploy to any static host (CDN)
- No server required
- Maximum performance

### 2. Image Optimization

```typescript
// next.config.ts
images: {
  unoptimized: true, // For static export
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [320, 640, 768, 1024], // Mobile-first sizes
  imageSizes: [64, 96, 128, 256],
}
```

### 3. Bundle Optimization

```typescript
// next.config.ts
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
  ],
}
```

### 4. Code Splitting

- Automatic code splitting by route
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### 5. Network-Aware Loading

```typescript
// Adaptive refresh rates based on connection
const refreshInterval = isSlowConnection ? 60000 : 10000;

// Conditional data fetching
const { data } = useSWR(
  shouldFetch ? '/api/data' : null,
  fetcher,
  { refreshInterval }
);
```

### 6. Polling Optimization

```typescript
// Webhook monitoring: 10 second refresh
useEffect(() => {
  const interval = setInterval(() => {
    mutateWebhooks();
    mutateStats();
  }, 10000);
  return () => clearInterval(interval);
}, []);
```

---

## State Management

### Server State (SWR)

- Dashboard statistics
- Transaction lists
- Entity data
- Webhook events

### Client State (React Hooks)

- Form inputs
- UI state (modals, filters)
- Theme preferences
- Pagination state

### Context Providers

```typescript
// Tenant configuration
<TenantProvider config={tenantConfig}>
  <OptimizedShell>
    {children}
  </OptimizedShell>
</TenantProvider>

// Theme
<ThemeProvider>
  <App />
</ThemeProvider>
```

---

## Error Handling

### Error Boundaries

```typescript
// components/error-boundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// lib/api-client.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage in components
try {
  await createTransaction(data);
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  }
}
```

---

## Mobile-First Design

### Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Mobile Optimizations

1. **Touch Targets**: Minimum 44x44px
2. **Font Sizes**: Minimum 16px to prevent zoom
3. **Viewport**: Proper meta viewport tag
4. **Images**: Responsive srcset
5. **Navigation**: Mobile hamburger menu

### Network-Aware Features

```typescript
// Reduce data for slow connections
const pageSize = isSlowConnection ? 10 : 20;
const imageQuality = isSlowConnection ? 50 : 80;
```

---

## Build Configuration

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 640, 768, 1024],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
```

---

## Development Guidelines

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Card } from '@/components/ui/card';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export function MyComponent({ title }: Props) {
  // 4. Hooks
  const [count, setCount] = useState(0);
  
  // 5. Handlers
  const handleClick = () => setCount(c => c + 1);
  
  // 6. Render
  return (
    <Card>
      <h1>{title}</h1>
      <button onClick={handleClick}>Count: {count}</button>
    </Card>
  );
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `DashboardShell.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-webhooks.ts`)
- Utilities: `kebab-case.ts` (e.g., `api-client.ts`)
- Styles: `kebab-case.css` (e.g., `globals.css`)

### Import Order

1. React/Next.js imports
2. Third-party libraries
3. Absolute imports (`@/components`)
4. Relative imports (`./utils`)
5. Types

---

## Testing

### Unit Tests

```typescript
// __tests__/components/button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

---

## Deployment

The frontend is deployed as a static export to Vercel:

```bash
cd apps/web
vercel --prod
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

---

## Related Documentation

- [API Documentation](../README.md#api-documentation)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Deployment Guide](../DEPLOYMENT.md)

---

**Last Updated**: 2026-01-31
