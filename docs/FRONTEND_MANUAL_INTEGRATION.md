# Frontend Integration Guide: Manual-First Approach

## Overview

This guide outlines the frontend changes needed to support the manual-first approach for Project Bridge, focusing on serving 80% of African informal economy businesses with simplified, mobile-optimized interfaces.

## Current Frontend State Analysis

### ✅ Working Components

- **Dashboard**: Comprehensive analytics view
- **Transaction Management**: Full CRUD operations
- **Entity Management**: Customer/supplier profiles
- **Webhook Monitoring**: Integration event tracking
- **Attachment Gallery**: Receipt and proof management
- **Responsive Design**: Works on mobile browsers

### ❌ Gaps for Manual Tenants

- **Complex UI**: Too many features for basic users
- **Desktop-first thinking**: Not optimized for mobile-first usage
- **No quick capture**: Slow transaction entry process
- **Missing offline support**: Requires constant connectivity
- **No voice/photo input**: Text-based only

## Recommended Frontend Adjustments

### 1. Create Tenant Context System

#### Hook for Tenant Detection

```typescript
// web/my-app/lib/hooks/use-tenant-type.ts
interface TenantType {
  isManual: boolean;
  isAdvanced: boolean;
  tier: "BASIC" | "ADVANCED" | "PREMIUM" | "ENTERPRISE";
  features: string[];
}

export function useTenantType(): TenantType {
  const { data: user } = useUser();

  return {
    isManual: user?.tenant?.tier === "BASIC",
    isAdvanced: ["ADVANCED", "PREMIUM", "ENTERPRISE"].includes(
      user?.tenant?.tier,
    ),
    tier: user?.tenant?.tier || "BASIC",
    features: user?.tenant?.features || [],
  };
}
```

#### Conditional Layout Wrapper

```typescript
// web/my-app/components/layout/TenantLayout.tsx
export function TenantLayout({ children }: { children: React.ReactNode }) {
  const { isManual } = useTenantType();

  if (isManual) {
    return (
      <ManualLayout>
        {children}
      </ManualLayout>
    );
  }

  return (
    <AdvancedLayout>
      {children}
    </AdvancedLayout>
  );
}
```

### 2. Manual Tenant Navigation Structure

#### Simplified Navigation

```typescript
// web/my-app/components/navigation/ManualNavigation.tsx
export function ManualNavigation() {
  const items = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/quick-capture', label: 'Add Sale', icon: Plus },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/inventory', label: 'Stock', icon: Package },
    { href: '/reports', label: 'Reports', icon: TrendingUp },
  ];

  return (
    <BottomNavigation>
      {items.map(item => (
        <NavigationItem key={item.href} {...item} />
      ))}
    </BottomNavigation>
  );
}
```

### 3. Quick Capture System

#### Quick Capture Page

```typescript
// web/my-app/app/(manual)/quick-capture/page.tsx
"use client";

import { useState } from 'react';
import { VoiceNoteRecorder } from '@/components/manual/VoiceNoteRecorder';
import { PhotoReceiptScanner } from '@/components/manual/PhotoReceiptScanner';
import { QuickTransactionForm } from '@/components/manual/QuickTransactionForm';

export default function QuickCapturePage() {
  const [mode, setMode] = useState<'voice' | 'photo' | 'manual'>('manual');
  const [transactionData, setTransactionData] = useState(null);

  return (
    <div className="flex flex-col h-full">
      {/* Mode Selector */}
      <div className="flex justify-around p-4 bg-secondary">
        <button
          onClick={() => setMode('voice')}
          className={`p-3 rounded-lg ${mode === 'voice' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          🎤 Voice
        </button>
        <button
          onClick={() => setMode('photo')}
          className={`p-3 rounded-lg ${mode === 'photo' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          📷 Photo
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`p-3 rounded-lg ${mode === 'manual' ? 'bg-primary text-primary-foreground' : ''}`}
        >
          ✏️ Manual
        </button>
      </div>

      {/* Capture Interface */}
      <div className="flex-1 p-4">
        {mode === 'voice' && (
          <VoiceNoteRecorder
            onTranscript={(text) => setTransactionData(parseVoiceNote(text))}
          />
        )}
        {mode === 'photo' && (
          <PhotoReceiptScanner
            onScanComplete={(data) => setTransactionData(data)}
          />
        )}
        {mode === 'manual' && (
          <QuickTransactionForm
            initialData={transactionData}
            onSubmit={handleTransactionSubmit}
          />
        )}
      </div>
    </div>
  );
}
```

#### Voice Note Recorder Component

```typescript
// web/my-app/components/manual/VoiceNoteRecorder.tsx
"use client";

import { useState, useRef } from 'react';

interface VoiceNoteRecorderProps {
  onTranscript: (text: string) => void;
}

export function VoiceNoteRecorder({ onTranscript }: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const response = await fetch('/api/v1/manual/transcribe', {
            method: 'POST',
            body: formData,
          });

          const { transcript } = await response.json();
          onTranscript(transcript);
        } catch (error) {
          console.error('Transcription failed:', error);
          // Fallback to manual input
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Tell me about your transaction</h2>
        <p className="text-muted-foreground">
          Say something like: "Sold 2kg tomatoes for 500 kes to Mary"
        </p>
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl transition-all
          ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary hover:bg-primary/90'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isProcessing ? '⏳' : isRecording ? '⏹️' : '🎤'}
      </button>

      {isRecording && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Recording... Tap to stop
        </p>
      )}

      {isProcessing && (
        <p className="text-sm text-muted-foreground">
          Processing your voice note...
        </p>
      )}
    </div>
  );
}
```

#### Photo Receipt Scanner Component

```typescript
// web/my-app/components/manual/PhotoReceiptScanner.tsx
"use client";

import { useState, useRef } from 'react';

interface PhotoReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
}

interface ReceiptData {
  amount?: number;
  merchant?: string;
  date?: string;
  items?: Array<{ name: string; price: number; quantity: number }>;
  category?: string;
}

export function PhotoReceiptScanner({ onScanComplete }: PhotoReceiptScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/v1/manual/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      const receiptData: ReceiptData = await response.json();
      onScanComplete(receiptData);
    } catch (error) {
      console.error('Receipt scanning failed:', error);
      // Fallback to manual input
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Scan your receipt</h2>
        <p className="text-muted-foreground">
          Take a photo or upload an image of your receipt
        </p>
      </div>

      <div className="w-64 h-64 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex flex-col items-center justify-center space-y-2 w-full h-full"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <span className="text-sm text-muted-foreground">Scanning...</span>
            </>
          ) : (
            <>
              <span className="text-4xl">📷</span>
              <span className="text-sm text-muted-foreground">Tap to camera</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p>Works best with clear, well-lit receipts</p>
        <p>Supports: JPG, PNG, HEIC</p>
      </div>
    </div>
  );
}
```

### 4. Manual Dashboard Simplification

#### Manual Dashboard Page

```typescript
// web/my-app/app/(manual)/dashboard/page.tsx
"use client";

import { useManualDashboardStats } from '@/lib/api-client';
import { formatCurrency } from '@/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Users,
  Package,
  AlertTriangle
} from 'lucide-react';

export default function ManualDashboardPage() {
  const { data: stats, isLoading } = useManualDashboardStats();

  return (
    <div className="p-4 space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Today's Business</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-KE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <Button asChild className="rounded-full w-12 h-12 p-0">
          <Link href="/quick-capture">
            <Plus className="w-6 h-6" />
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">
              Money In
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(stats?.moneyIn || 0, 'KES')}
            </div>
            <p className="text-xs text-emerald-600">
              {stats?.salesCount || 0} sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Money Out
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(stats?.moneyOut || 0, 'KES')}
            </div>
            <p className="text-xs text-red-600">
              {stats?.expensesCount || 0} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net Profit */}
      <Card className={stats?.netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${stats?.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(stats?.netProfit || 0, 'KES')}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats?.netProfit >= 0 ? 'Good day!' : 'Keep going!'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Quick Insights</h2>

        {stats?.lowStockItems && stats.lowStockItems.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.lowStockItems.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-orange-600">{item.quantity} left</span>
                  </div>
                ))}
              </div>
              {stats.lowStockItems.length > 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{stats.lowStockItems.length - 3} more items
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {stats?.topCustomer && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Best Customer Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="font-medium">{stats.topCustomer.name}</span>
                <span className="text-sm font-mono">
                  {formatCurrency(stats.topCustomer.amount, 'KES')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentSales?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No sales yet today
            </p>
          ) : (
            <div className="space-y-3">
              {stats?.recentSales?.slice(0, 5).map((sale: any) => (
                <div key={sale.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{sale.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.timestamp).toLocaleTimeString('en-KE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="font-mono font-semibold">
                    {formatCurrency(sale.amount, 'KES')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Progressive Web App Configuration

#### PWA Manifest

```json
// web/my-app/public/manifest.json
{
  "name": "Project Bridge - Business Manager",
  "short_name": "Bridge Business",
  "description": "Simple business management for African entrepreneurs",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker for Offline Support

```typescript
// web/my-app/public/sw.js
const CACHE_NAME = "bridge-business-v1";
const URLS_TO_CACHE = [
  "/",
  "/dashboard",
  "/quick-capture",
  "/customers",
  "/static/css/bundle.css",
  "/static/js/bundle.js",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE)),
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});
```

### 6. API Client Extensions

#### Manual-specific API calls

```typescript
// web/my-app/lib/api-client/manual.ts
import { apiClient } from "./api-client";

export interface QuickCaptureDto {
  voiceNote?: Blob;
  receiptPhoto?: Blob;
  quickCategory?: "sale" | "expense" | "purchase";
  amount?: number;
  customer?: string;
  items?: string[];
  paymentMethod?: "cash" | "mpesa" | "credit";
}

export interface ManualDashboardStats {
  moneyIn: number;
  moneyOut: number;
  netProfit: number;
  salesCount: number;
  expensesCount: number;
  topCustomer?: {
    name: string;
    amount: number;
  };
  lowStockItems: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  recentSales: Array<{
    id: string;
    customerName: string;
    amount: number;
    timestamp: string;
  }>;
}

export const manualApi = {
  // Quick capture
  quickCapture: (data: QuickCaptureDto) =>
    apiClient.post("/manual/quick-capture", data),

  // Voice transcription
  transcribeAudio: (audioFile: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioFile);
    return apiClient.post("/manual/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Receipt scanning
  scanReceipt: (imageFile: Blob) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return apiClient.post("/manual/scan-receipt", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Manual dashboard stats
  getDashboardStats: () =>
    apiClient.get<ManualDashboardStats>("/manual/dashboard-stats"),

  // SMS summary
  sendSMSSummary: () => apiClient.post("/manual/send-sms-summary"),

  // Smart suggestions
  getSuggestions: () => apiClient.get("/manual/suggestions"),
};
```

### 7. Touch-Optimized UI Components

#### Large Button Component

```typescript
// web/my-app/components/ui/large-button.tsx
import { Button } from './button';
import { cn } from '@/lib/utils';

interface LargeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'lg' | 'xl';
  fullWidth?: boolean;
}

export function LargeButton({
  className,
  size = 'lg',
  fullWidth = true,
  children,
  ...props
}: LargeButtonProps) {
  const sizeClasses = {
    lg: 'h-16 text-lg px-8',
    xl: 'h-20 text-xl px-12'
  };

  return (
    <Button
      className={cn(
        'rounded-2xl font-semibold touch-manipulation',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
```

#### Touch-Friendly Input

```typescript
// web/my-app/components/ui/touch-input.tsx
import { Input } from './input';
import { cn } from '@/lib/utils';

interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function TouchInput({
  className,
  label,
  error,
  ...props
}: TouchInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <Input
        className={cn(
          'h-14 text-lg rounded-xl touch-manipulation',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

## Implementation Priority

### Phase 1 (Week 1-2): Core Manual Features

1. **Tenant type detection** -区分 manual vs advanced users
2. **Quick capture interface** - Voice, photo, manual input
3. **Manual dashboard** - Simplified metrics view
4. **Mobile navigation** - Bottom tab navigation

### Phase 2 (Week 3-4): Mobile Optimization

1. **PWA configuration** - Installable app experience
2. **Offline support** - Basic functionality offline
3. **Touch optimization** - Large buttons, input fields
4. **Performance optimization** - 3G network support

### Phase 3 (Week 5-6): Intelligence Features

1. **Smart suggestions** - Based on transaction history
2. **Auto-categorization** - ML-powered categorization
3. **Customer insights** - Purchase pattern analysis
4. **Inventory alerts** - Low stock notifications

## Testing Strategy

### Manual User Testing

- Recruit actual shop owners from target markets
- Test on low-end Android devices (2GB RAM, 3G networks)
- Test with varying literacy levels
- Test offline scenarios
- Test with different payment methods

### Performance Testing

- Load time under 3 seconds on 3G
- Memory usage under 100MB
- Battery impact minimal
- Works offline for 24+ hours

This frontend integration plan ensures Project Bridge can effectively serve 80% of African informal economy businesses with simple, powerful tools that don't require technical expertise or complex integrations.
