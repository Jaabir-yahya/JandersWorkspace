"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_CODE_MAPPING = void 0;
exports.getAccountCode = getAccountCode;
exports.ACCOUNT_CODE_MAPPING = {
    RETAIL: '200-SALES',
    SERVICE: '400-SERVICE-INCOME',
    RENTAL: '500-RENTAL-INCOME',
    EXPENSE: '600-EXPENSES',
};
function getAccountCode(type) {
    return exports.ACCOUNT_CODE_MAPPING[type] || '200-SALES';
}
//# sourceMappingURL=universal-invoice.interface.js.map