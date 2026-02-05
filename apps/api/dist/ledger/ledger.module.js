"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerModule = void 0;
const common_1 = require("@nestjs/common");
const accounts_service_1 = require("./accounts.service");
const transactions_service_1 = require("./transactions.service");
const business_service_1 = require("./business.service");
const reporting_service_1 = require("./reporting.service");
const rpc_service_1 = require("./rpc.service");
const accounts_controller_1 = require("./accounts.controller");
const transactions_controller_1 = require("./transactions.controller");
const business_controller_1 = require("./business.controller");
const reporting_controller_1 = require("./reporting.controller");
const rpc_controller_1 = require("./rpc.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let LedgerModule = class LedgerModule {
};
exports.LedgerModule = LedgerModule;
exports.LedgerModule = LedgerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [
            accounts_controller_1.AccountsController,
            transactions_controller_1.TransactionsController,
            business_controller_1.BusinessController,
            reporting_controller_1.ReportingController,
            rpc_controller_1.RpcController,
        ],
        providers: [
            accounts_service_1.AccountsService,
            transactions_service_1.TransactionsService,
            business_service_1.BusinessService,
            reporting_service_1.ReportingService,
            rpc_service_1.RpcService,
        ],
        exports: [
            accounts_service_1.AccountsService,
            transactions_service_1.TransactionsService,
            business_service_1.BusinessService,
            reporting_service_1.ReportingService,
            rpc_service_1.RpcService,
        ],
    })
], LedgerModule);
//# sourceMappingURL=ledger.module.js.map