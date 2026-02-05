"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliesModule = void 0;
const common_1 = require("@nestjs/common");
const supplies_controller_1 = require("./supplies.controller");
const supplies_service_1 = require("./supplies.service");
const prisma_module_1 = require("../prisma/prisma.module");
const universal_truth_module_1 = require("../universal-truth/universal-truth.module");
let SuppliesModule = class SuppliesModule {
};
exports.SuppliesModule = SuppliesModule;
exports.SuppliesModule = SuppliesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, universal_truth_module_1.UniversalTruthModule],
        controllers: [supplies_controller_1.SuppliesController],
        providers: [supplies_service_1.SuppliesService],
        exports: [supplies_service_1.SuppliesService],
    })
], SuppliesModule);
//# sourceMappingURL=supplies.module.js.map