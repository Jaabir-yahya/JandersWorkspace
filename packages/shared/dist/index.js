"use strict";
/**
 * Project Bridge Shared Package
 * Contains Kenyan business logic, utilities, and shared code
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Kenya-specific exports
__exportStar(require("./kenya"), exports);
// Ledger & Truth Engine
__exportStar(require("./ledger/truth-engine"), exports);
// Pulse & Metrics
__exportStar(require("./pulse/pulse-calculators"), exports);
// Intelligence & Insights
__exportStar(require("./intelligence/kenyan-insights"), exports);
__exportStar(require("./intelligence/people-intelligence"), exports);
__exportStar(require("./intelligence/inventory-intelligence"), exports);
// Utilities
__exportStar(require("./utils/nl-foundation"), exports);
__exportStar(require("./utils/storyteller"), exports);
// Data cleaning pipeline exports
__exportStar(require("./data-cleaning"), exports);
