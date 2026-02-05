# Integrations Package 🔌

This package handles all external service connections for the "Tech User" tier (20%).

## Adding a New Integration

1.  **Create Directory**: Add a new folder here (e.g., `src/mpesa/`, `src/shopify/`).
2.  **Define Service**: Create a class that implements the standard interface.
3.  **Export**: Export it from `src/index.ts`.
4.  **Backend Usage**: Import in `apps/api/src/integrations` and use via the `IntegrationService`.

## Current Integrations
- **M-Pesa**: Payment processing (Kenya).
- **WhatsApp**: Messaging and notifications.

## Best Practices
- **Feature Flags**: Always wrap integration logic in feature flags so Manual Users (80%) aren't affected.
- **Async**: Use queues/webhooks for heavy operations to keep the UI snappy for manual entry.
