# LedgerFlow Development Guide

## 🎯 Architecture Overview

LedgerFlow follows a **manual-first, truth-engine-centered** architecture where:
1. User enters data in optimized forms
2. System generates ledger preview in real-time
3. User verifies accounting impact before submission
4. Backend atomically commits: business record + ledger + audit

## 🏗️ Core Architecture Principles

### 1. The Universal Truth Engine

Every transaction flows through the same pattern:

```
User Input → Form Validation → Ledger Preview → API → Atomic Transaction
                                                           ↓
                                        [Business Record + Ledger + Audit]
```

### 2. Component Hierarchy

```
App Layout (Sidebar + Header)
  ↓
Page Components (Dashboard, Supplies, Invoices, Reports)
  ↓
Form Components (with LedgerPreview)
  ↓
UI Components (Button, Input, Card, etc.)
  ↓
Utils & Store (Helpers, State Management)
```

### 3. Data Flow

```
User Action → Local State → Computed Ledger Entries → API Call → Backend
                                                          ↓
                                                    Success/Error
                                                          ↓
                                                    Update UI + Store
```

## 📦 Adding a New Feature

### Example: Adding "Expense Tracking"

#### Step 1: Define Types (`lib/types.ts`)

```typescript
export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  description: string;
  receipt?: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
}

export interface ExpenseForm {
  date: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  notes: string;
}
```

#### Step 2: Create Page (`app/expenses/page.tsx`)

```typescript
'use client';

import { useState, useMemo } from 'react';
import { LedgerPreview } from '@/components/LedgerPreview';
import type { ExpenseForm, LedgerEntry } from '@/lib/types';

export default function ExpensesPage() {
  const [formData, setFormData] = useState<ExpenseForm>({
    date: getTodayDate(),
    category: '',
    amount: 0,
    paymentMethod: 'CASH',
    description: '',
    notes: '',
  });

  // Calculate ledger entries
  const ledgerEntries = useMemo((): LedgerEntry[] => {
    if (!formData.category || formData.amount <= 0) return [];

    return [
      // Debit: Expense Account
      {
        id: '1',
        accountId: 'acc-expense',
        accountCode: '5000',
        accountName: `Expense - ${formData.category}`,
        debit: formData.amount,
        credit: 0,
        currency: 'KES',
      },
      // Credit: Cash/Bank depending on payment method
      {
        id: '2',
        accountId: 'acc-cash',
        accountCode: '1100',
        accountName: formData.paymentMethod === 'CASH' ? 'Cash' : 'Bank',
        debit: 0,
        credit: formData.amount,
        currency: 'KES',
      },
    ];
  }, [formData]);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        {/* Form components */}
      </div>
      <div className="col-span-1">
        <LedgerPreview entries={ledgerEntries} currency="KES" />
      </div>
    </div>
  );
}
```

#### Step 3: Add to Navigation (`components/Sidebar.tsx`)

```typescript
const navigation: NavItem[] = [
  // ... existing items
  { name: 'Expenses', href: '/expenses', icon: Receipt },
];
```

#### Step 4: Create API Integration (`lib/api.ts` - create if doesn't exist)

```typescript
export async function createExpense(data: ExpenseForm) {
  const response = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create expense');
  }
  
  return response.json();
}
```

## 🎨 Styling Guidelines

### Color Usage

```typescript
// Success states
className="bg-acacia-100 text-acacia-800"

// Warning/Expenses
className="bg-clay-100 text-clay-800"

// Info/Neutral
className="bg-savanna-200 text-savanna-800"

// Backgrounds
className="bg-savanna-50" // Page background
className="bg-white" // Card background
```

### Animation Classes

```typescript
// Page load
className="animate-fade-in"

// Staggered cards
className="animate-slide-up delay-100"

// Interactive elements
className="animate-scale-in"
```

### Typography

```typescript
// Headings
className="font-display font-bold text-3xl"

// Body text
className="font-sans text-baobab-900"

// Currency/Numbers
className="font-mono currency"
```

## 🔧 Utility Functions

### Creating Custom Utilities

Add to `lib/utils.ts`:

```typescript
// Example: Calculate compound interest
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number
): number {
  return principal * Math.pow(1 + rate / 100, years);
}

// Example: Validate Kenyan phone number
export function isValidKenyanPhone(phone: string): boolean {
  return /^(?:254|\+254|0)?([17](?:(?:[0-9][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/.test(phone);
}
```

## 🎯 Form Best Practices

### 1. Always Provide Ledger Preview

```typescript
const ledgerEntries = useMemo(() => {
  // Calculate entries based on form state
  return calculateEntries(formData);
}, [formData]);

return (
  <>
    <Form />
    <LedgerPreview entries={ledgerEntries} currency={currency} />
  </>
);
```

### 2. Validate Before Submit

```typescript
const handleSubmit = async () => {
  // Validate required fields
  if (!formData.required) {
    toast.error('Please fill required fields');
    return;
  }

  // Validate ledger balance
  const validation = validateLedgerEntries(ledgerEntries);
  if (!validation.isValid) {
    toast.error(validation.error);
    return;
  }

  // Submit
  try {
    await createTransaction(formData);
    toast.success('Transaction saved!');
  } catch (error) {
    toast.error('Failed to save');
  }
};
```

### 3. Keyboard Shortcuts

```typescript
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSubmit();
    }
  };

  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, []);
```

## 📊 State Management

### Using Zustand Store

```typescript
// Reading state
const { accounts, suppliers } = useAppStore();

// Updating state
const { setAccounts, addToOfflineQueue } = useAppStore();

// Example: Adding offline support
const handleSubmitOffline = async (data: any) => {
  if (!navigator.onLine) {
    addToOfflineQueue({
      id: generateId(),
      type: 'CREATE',
      entity: 'purchase',
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    });
    toast.info('Saved offline. Will sync when online.');
  } else {
    await submitToAPI(data);
  }
};
```

## 🧪 Testing Guidelines

### Component Testing

```typescript
// Example test structure (using Jest + React Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
```

### Ledger Calculation Testing

```typescript
describe('calculateLedgerEntries', () => {
  it('creates balanced entries for purchase', () => {
    const purchase = {
      amount: 1000,
      paymentMethod: 'CASH',
    };

    const entries = calculatePurchaseLedgerEntries(purchase);
    const validation = validateLedgerEntries(entries);

    expect(validation.isValid).toBe(true);
    expect(validation.totalDebit).toBe(validation.totalCredit);
  });
});
```

## 🌐 API Integration Checklist

When connecting to backend:

- [ ] Environment variables configured
- [ ] API client created (`lib/api.ts`)
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Offline queue tested
- [ ] CORS headers configured
- [ ] Authentication tokens handled
- [ ] Rate limiting considered

## 🚀 Performance Optimization

### 1. Use Memoization

```typescript
const expensiveCalculation = useMemo(() => {
  return complexOperation(data);
}, [data]);
```

### 2. Lazy Load Heavy Components

```typescript
const HeavyChart = lazy(() => import('@/components/HeavyChart'));

<Suspense fallback={<Loading />}>
  <HeavyChart data={data} />
</Suspense>
```

### 3. Debounce Search

```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => performSearch(query), 300),
  []
);
```

## 🔐 Security Best Practices

### 1. Sanitize Inputs

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedInput = DOMPurify.sanitize(userInput);
```

### 2. Validate on Client AND Server

```typescript
// Client validation
if (!isValidEmail(email)) {
  return setError('Invalid email');
}

// Server will also validate - never trust client
```

### 3. Protect Sensitive Data

```typescript
// Never log sensitive data
console.log('Payment processed'); // ✅
console.log('MPesa code:', code); // ❌
```

## 📱 Mobile Considerations

### Touch Targets

```typescript
// Minimum 44x44px for touch
className="min-h-[44px] min-w-[44px]"
```

### Responsive Breakpoints

```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## 🎓 Learning Resources

### Understanding Double-Entry Accounting
- Every transaction affects at least 2 accounts
- Total debits must equal total credits
- Assets = Liabilities + Equity (the accounting equation)

### Chart of Accounts Structure
```
1000-1999: Assets (Debit normal balance)
2000-2999: Liabilities (Credit normal balance)
3000-3999: Equity (Credit normal balance)
4000-4999: Revenue (Credit normal balance)
5000-5999: Expenses (Debit normal balance)
```

### Common Ledger Patterns

**Purchase (Cash)**
```
Debit: Inventory/Expense
Credit: Cash
```

**Purchase (On Account)**
```
Debit: Inventory/Expense
Credit: Accounts Payable
```

**Invoice**
```
Debit: Accounts Receivable
Credit: Revenue
```

**Payment Received**
```
Debit: Cash/Bank
Credit: Accounts Receivable
```

## 🤝 Code Review Checklist

Before submitting PR:

- [ ] TypeScript types defined
- [ ] Ledger preview implemented
- [ ] Offline support added
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Toast notifications added
- [ ] Comments for complex logic
- [ ] No console.logs left
- [ ] Follows existing patterns

## 📞 Getting Help

For questions:
1. Check existing components for patterns
2. Review this guide
3. Check the main README
4. Contact the core development team

---

**Happy Coding! 🚀**
