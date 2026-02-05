# Contributing to African Business Platform

Thank you for your interest in contributing! We welcome contributions from developers, designers, and business experts across Africa and beyond.

## 🤝 Ways to Contribute

### 1. Code Contributions
- Fix bugs
- Add new features
- Improve performance
- Write tests
- Improve documentation

### 2. Design Contributions
- UI/UX improvements
- Mobile optimization
- Accessibility enhancements
- Brand assets

### 3. Documentation
- Tutorials and guides
- API documentation
- Translations
- Video walkthroughs

### 4. Community Support
- Answer questions on GitHub Issues
- Help other users in forums
- Share use cases and feedback
- Beta testing

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/african-business-platform.git
cd african-business-platform
```

### 3. Set Up Development Environment

```bash
# Run the setup script
./setup.sh

# Or manually:
pnpm install
cp apps/web/.env.example apps/web/.env.local
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 5. Make Your Changes

- Follow the coding standards (see below)
- Write clear commit messages
- Add tests if applicable
- Update documentation

### 6. Test Your Changes

```bash
# Run development server
pnpm dev

# Run tests (when available)
pnpm test

# Check TypeScript
pnpm type-check

# Lint code
pnpm lint
```

### 7. Commit Your Changes

```bash
git add .
git commit -m "feat: add invoice PDF export"
```

Commit message format:
```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```bash
git commit -m "feat: add M-Pesa payment integration"
git commit -m "fix: correct currency rounding in reports"
git commit -m "docs: update deployment guide for VPS"
```

### 8. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 9. Create Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Provide a clear description of your changes
- Link any related issues
- Wait for review

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function createUser(data: Partial<User>): User {
  // Implementation
}

// ❌ Avoid
function createUser(data: any): any {
  // Implementation
}
```

### React Components

```tsx
// ✅ Good - Named export with clear props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button className={variant} onClick={onClick}>
      {children}
    </button>
  );
}

// ❌ Avoid - Default export with unclear types
export default function Button(props: any) {
  // Implementation
}
```

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/          # Reusable UI components
│   ├── forms/       # Form components
│   └── features/    # Feature-specific components
├── lib/             # Utility functions and API
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
└── styles/          # Global styles
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserData`)
- **CSS Classes**: kebab-case or Tailwind utilities

### Comments

```typescript
// ✅ Good - Explains why, not what
// Using debounce to prevent excessive API calls on search
const debouncedSearch = debounce(searchFunction, 300);

// ❌ Avoid - States the obvious
// This function adds two numbers
function add(a: number, b: number) {
  return a + b;
}
```

## 🌍 African Context Guidelines

When contributing, keep in mind:

### 1. Connectivity
- Assume intermittent internet
- Optimize for low bandwidth
- Implement offline capabilities
- Show clear loading states

### 2. Mobile First
- Design for mobile screens first
- Use large touch targets (44x44px minimum)
- Test on mid-range Android devices
- Consider data costs

### 3. Localization
- Support multiple currencies (KES, UGX, TZS, RWF, etc.)
- Allow for local payment methods (M-Pesa, Airtel Money)
- Use clear, simple language
- Plan for translations (Swahili, French, etc.)

### 4. Cultural Sensitivity
- Understand local business practices
- Respect documentation requirements
- Consider cash-heavy economies
- Support receipt attachments

### 5. Accessibility
- High contrast for outdoor visibility
- Clear typography
- Keyboard navigation
- Screen reader support

## 🧪 Testing Guidelines

### Manual Testing

Before submitting:
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS and Android)
- [ ] Test with slow network (throttling)
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Verify all forms work
- [ ] Check error handling

### Writing Tests (Future)

```typescript
// Example unit test
describe('formatCurrency', () => {
  it('formats KES correctly', () => {
    expect(formatCurrency(1000, 'KES')).toBe('KSh 1,000.00');
  });
  
  it('handles zero decimals for UGX', () => {
    expect(formatCurrency(1000, 'UGX')).toBe('USh 1,000');
  });
});
```

## 📋 Pull Request Checklist

Before submitting your PR:

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No new warnings generated
- [ ] Tests added/updated (when applicable)
- [ ] Tested on mobile and desktop
- [ ] Commit messages are clear
- [ ] PR description explains changes

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**:
   - Browser and version
   - Operating system
   - Device (if mobile)
   - Network conditions

Example:
```markdown
**Bug**: Invoice total calculation incorrect with tax

**Steps**:
1. Create new invoice
2. Add item: Rice, Qty: 10, Price: 1000
3. Add tax rate: 16%
4. Observe total

**Expected**: Total should be KSh 11,600
**Actual**: Total shows KSh 10,000

**Environment**: 
- Chrome 120, Windows 11
- Desktop
```

## 💡 Feature Requests

When suggesting features:

1. **Problem**: What problem does it solve?
2. **Solution**: Proposed solution
3. **Alternatives**: Other options considered
4. **Context**: Why is this important?
5. **Users**: Who benefits?

Example:
```markdown
**Feature**: Bulk invoice generation

**Problem**: Small businesses need to invoice 50+ customers monthly, doing this one-by-one is time-consuming.

**Solution**: Add "Bulk Invoice" feature that:
- Accepts CSV upload with customer IDs and amounts
- Generates all invoices in one batch
- Allows review before finalizing

**Context**: Common in wholesale/distribution businesses in Nairobi.

**Benefits**: Saves 2-3 hours monthly for typical user.
```

## 📞 Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: security@yourdomain.com for security issues
- **Twitter/X**: @yourhandle for announcements

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor channels

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

Unacceptable behavior:
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct deemed unprofessional

Report violations to: conduct@yourdomain.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, makes a difference. Thank you for helping make business management more accessible across Africa!

---

**Questions?** Open an issue or discussion on GitHub.
