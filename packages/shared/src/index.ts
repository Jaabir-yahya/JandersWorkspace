/**
 * Project Bridge Shared Package
 * Contains Kenyan business logic, utilities, and shared code
 */

// Kenya-specific exports
export * from './kenya';

// Ledger & Truth Engine
export * from './ledger/truth-engine';

// Pulse & Metrics
export * from './pulse/pulse-calculators';

// Intelligence & Insights
export * from './intelligence/kenyan-insights';
export * from './intelligence/people-intelligence';
export * from './intelligence/inventory-intelligence';

// Utilities
export * from './utils/nl-foundation';
export * from './utils/storyteller';

// Data cleaning pipeline exports
export * from './data-cleaning';
