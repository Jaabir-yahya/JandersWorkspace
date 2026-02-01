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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const auth_module_1 = require("./auth.module");
let AuthService = class AuthService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async verifyToken(token) {
        const { data: { user }, error, } = await this.supabase.auth.getUser(token);
        if (error || !user) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const tenantId = user.user_metadata?.['tenant_id'];
        const role = user.user_metadata?.['role'] || 'user';
        if (!tenantId) {
            throw new common_1.UnauthorizedException('User is not associated with a tenant');
        }
        return {
            id: user.id,
            email: user.email || '',
            tenantId,
            role,
        };
    }
    async getUserById(userId) {
        const { data: { user }, error, } = await this.supabase.auth.admin.getUserById(userId);
        if (error || !user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async signIn(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return data;
    }
    async signUp(email, password, tenantId, role = 'user') {
        const { data, error } = await this.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                tenant_id: tenantId,
                role,
            },
        });
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return data;
    }
    async signOut(token) {
        const { error } = await this.supabase.auth.admin.signOut(token);
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_module_1.SUPABASE_AUTH_CLIENT)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], AuthService);
//# sourceMappingURL=auth.service.js.map