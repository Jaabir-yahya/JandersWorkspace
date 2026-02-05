# Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

```bash
# 1. Clone and setup
git clone <repo-url>
cd african-business-platform
./setup.sh

# 2. Start development
pnpm dev

# 3. Open browser
# http://localhost:3000
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+D` | Dashboard |
| `Ctrl+I` | Inventory |
| `Ctrl+P` | New Purchase |
| `Ctrl+N` | New Item |
| `Ctrl+M` | Record Payment |
| `Ctrl+S` | Save Form |
| `Ctrl+K` | Quick Search |
| `Esc` | Close Modal |

## 📂 Key Files & Folders

```
apps/web/src/
├── app/              # Pages (edit these for UI)
├── components/       # Reusable components
├── lib/
│   ├── api-client.ts # API calls (edit for backend)
│   └── utils.ts      # Helper functions
└── types/index.ts    # Data structures
```

## 🔧 Common Tasks

### Add a New Page
```tsx
// apps/web/src/app/newpage/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### Add API Endpoint
```typescript
// apps/web/src/lib/api-client.ts
export const api = {
  // ... existing code
  myEndpoint: {
    list: () => request({ method: 'GET', url: '/my-endpoint' }),
  },
};
```

### Add New Component
```tsx
// apps/web/src/components/ui/my-component.tsx
interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>;
}
```

## 🎨 Styling

### Tailwind Classes
```tsx
// Primary button
<button className="bg-primary-600 text-white px-4 py-2 rounded-lg">

// Card
<div className="bg-white border border-neutral-200 rounded-lg p-6">

// Badge
<span className="badge-success">Paid</span>
```

### Custom Styles
Edit `apps/web/src/styles/globals.css`

## 📊 Data Flow

```
User Action
    ↓
Component (React Query)
    ↓
API Client
    ↓
Backend API
    ↓
Database
    ↓
Response
    ↓
Component Update
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Dependencies Issues
```bash
rm -rf node_modules
pnpm install
```

### Build Errors
```bash
rm -rf .next
pnpm build
```

### Type Errors
```bash
pnpm type-check
```

## 🔗 Important Links

- [Full README](README.md) - Complete documentation
- [Deployment Guide](DEPLOYMENT.md) - How to deploy
- [Contributing](CONTRIBUTING.md) - How to contribute

## 💬 Get Help

1. Check [README.md](README.md) first
2. Search GitHub Issues
3. Open new issue with details
4. Join community chat

## 📱 Mobile Testing

```bash
# Get your local IP
ipconfig getifaddr en0  # Mac
hostname -I             # Linux

# Access from phone
http://YOUR_IP:3000
```

## 🔐 Security Notes

- Never commit `.env` files
- Use environment variables for secrets
- Keep dependencies updated
- Regular backups!

## 📦 Deployment Quick Commands

### Vercel
```bash
vercel
```

### VPS
```bash
pnpm build
pm2 start npm --name "app" -- start
```

### Docker
```bash
docker build -t app .
docker run -p 3000:3000 app
```

---

**Need more details?** See full documentation in README.md
