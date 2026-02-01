# Frontend V1 Archive

## Overview

This archive contains the original Next.js 15 frontend for Project Bridge, archived on **January 31, 2026**.

## What This Archive Contains

This is the complete first version of the Project Bridge web frontend, built with:

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with 40+ shadcn/ui components
- **State Management**: React hooks and context
- **Build Tool**: Turborepo integration

### Key Files and Directories

```
├── app/                    # Next.js App Router pages
│   ├── (optimized)/        # Optimized route group
│   ├── create/             # Create transaction page
│   ├── dashboard/          # Dashboard page
│   ├── manager/            # Manager view
│   ├── people/             # People management
│   ├── proof/              # Proof/verification page
│   └── webhooks/           # Webhook management
├── components/             # React components
│   ├── ui/                 # 40+ Radix UI components
│   └── *.tsx               # Page shells and shared components
├── lib/                    # Utility libraries
│   ├── api/                # API client functions
│   ├── hooks/              # Custom React hooks
│   └── *.ts                # Utility functions and types
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui configuration
└── .gitignore              # Git ignore rules
```

## Why It Was Archived

### 1. **Bloated Component Library**
The frontend included 40+ Radix UI components (accordion, alert-dialog, avatar, breadcrumb, etc.) when only a handful were actually used. This created unnecessary bundle bloat and complexity.

### 2. **Not Optimized for African Connectivity**
The original design was built for high-speed, stable internet connections. It did not account for:
- 2G/3G network conditions common in Kenya
- Limited data budgets of informal economy workers
- Low-end mobile devices
- Intermittent connectivity

### 3. **Over-Engineered for MVP**
The first version included features and UI patterns better suited for a mature SaaS product rather than an MVP focused on core functionality.

### 4. **Mobile-First Neglect**
While responsive, the design prioritized desktop experiences. Project Bridge's users are primarily mobile-first, often using entry-level smartphones.

## What Comes Next

A new minimal MVP frontend will be created in `apps/web/` with:

- **Ultra-lightweight**: Only essential components, no bloat
- **Mobile-first**: Designed for small screens and touch interactions
- **2G/3G optimized**: Aggressive code splitting, minimal JavaScript, offline capabilities
- **Fast**: Sub-3 second load times on slow connections
- **Progressive**: Core functionality works without JavaScript

## Historical Context

This frontend represented the initial vision for Project Bridge's user interface. While it demonstrated the platform's capabilities, user research and technical constraints revealed the need for a more focused, resource-conscious approach suitable for Nairobi's informal economy.

## Restoring This Archive

If needed, this archive can be restored by copying its contents back to `apps/web/`:

```bash
cp -r archive/frontend-v1/* apps/web/
```

---

**Archive Date**: January 31, 2026  
**Project**: Project Bridge  
**Purpose**: Bridging Nairobi's informal economy to digital tools
