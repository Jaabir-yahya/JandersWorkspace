# Changelog

All notable changes to Project Bridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - Phase 3 Lock - 2026-01-30

### Added
- **Transaction State Machine**: Full lifecycle from DRAFT → POSTED → RECONCILED with reversal support
- **Three Majors Support**: RETAIL, SERVICE, and RENTAL transaction types with appropriate account codes
- **Entity Management**: 360° view of customers/suppliers with transaction history and running balance
- **Split Payment Records**: Support for CASH, M-PESA, BANK TRANSFER, and CARD payments
- **File Attachment System**: Upload and manage receipts and documents
- **Universal Invoice Export**: Standardized format compatible with QBO, Xero, and Kick
- **Multi-tenancy**: Complete tenant isolation at database and API levels
- **Six Immutability Locks**: Database-level enforcement preventing modification of posted transactions
- **Frontend**: 5-page Next.js application (Dashboard, Create, Manager, People, Proof)
- **Build Infrastructure**:
  - Root-level orchestration scripts (`npm run dev`, `npm run build`)
  - ngrok tunneling support for external testing
  - Environment configuration templates
  - Health check and verification scripts
  - Concurrent development workflow

### Security
- Row Level Security (RLS) policies for tenant isolation
- Immutable transaction ledger with trigger enforcement
- Input validation via DTOs

### Technical
- NestJS backend with Supabase PostgreSQL
- Next.js 15 frontend with TypeScript
- Database functions for complex operations
- Comprehensive API documentation

## [0.2.0] - Phase 2 - 2026-01-15

### Added
- Core transaction CRUD operations
- Basic entity management
- State machine foundation
- API contract definition

## [0.1.0] - Phase 1 - 2026-01-01

### Added
- Project initialization
- Database schema design
- Basic NestJS setup
- Transaction ledger concept
