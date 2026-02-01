"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = exports.SUPABASE_AUTH_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const auth_guard_1 = require("./auth.guard");
const auth_service_1 = require("./auth.service");
exports.SUPABASE_AUTH_CLIENT = 'SUPABASE_AUTH_CLIENT';
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: exports.SUPABASE_AUTH_CLIENT,
                useFactory: (configService) => {
                    const url = configService.get('SUPABASE_URL');
                    const serviceRoleKey = configService.get('SUPABASE_SERVICE_ROLE_KEY');
                    if (!url || !serviceRoleKey) {
                        throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
                    }
                    return (0, supabase_js_1.createClient)(url, serviceRoleKey, {
                        auth: {
                            persistSession: false,
                            autoRefreshToken: false,
                        },
                    });
                },
                inject: [config_1.ConfigService],
            },
            auth_service_1.AuthService,
            auth_guard_1.AuthGuard,
        ],
        exports: [exports.SUPABASE_AUTH_CLIENT, auth_service_1.AuthService, auth_guard_1.AuthGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map