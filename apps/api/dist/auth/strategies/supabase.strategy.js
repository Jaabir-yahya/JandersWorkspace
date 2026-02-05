"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const nestjs_supabase_auth_1 = require("nestjs-supabase-auth");
const config_1 = require("@nestjs/config");
let SupabaseStrategy = class SupabaseStrategy extends (0, passport_1.PassportStrategy)(nestjs_supabase_auth_1.SupabaseAuthStrategy, 'supabase') {
    configService;
    constructor(configService) {
        const supabaseUrl = configService.get('SUPABASE_URL');
        const supabaseKey = configService.get('SUPABASE_SECRET_KEY');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
        }
        super({
            supabaseUrl,
            supabaseKey,
            supabaseOptions: {},
            extractor: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
        this.configService = configService;
    }
    validate(payload) {
        const tenantId = payload.user_metadata?.['tenant_id'];
        const role = payload.user_metadata?.['role'] || 'user';
        return {
            id: payload.sub,
            email: payload.email,
            tenantId,
            role,
            user_metadata: payload.user_metadata,
        };
    }
};
exports.SupabaseStrategy = SupabaseStrategy;
exports.SupabaseStrategy = SupabaseStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseStrategy);
//# sourceMappingURL=supabase.strategy.js.map