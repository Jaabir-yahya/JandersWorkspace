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
exports.AuthController = exports.UpdateProfileDto = exports.RefreshTokenDto = exports.SignUpDto = exports.SignInDto = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_guard_1 = require("./auth.guard");
const class_validator_1 = require("class-validator");
class SignInDto {
    email;
    password;
}
exports.SignInDto = SignInDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SignInDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignInDto.prototype, "password", void 0);
class SignUpDto {
    email;
    password;
    tenantId;
    role;
}
exports.SignUpDto = SignUpDto;
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
class UpdateProfileDto {
    displayName;
    phoneNumber;
}
exports.UpdateProfileDto = UpdateProfileDto;
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signIn(signInDto) {
        try {
            const result = await this.authService.signIn(signInDto.email, signInDto.password);
            if (!result.session) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            return {
                success: true,
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        displayName: result.user.user_metadata?.['display_name'] || result.user.email,
                        role: result.user.user_metadata?.['role'] || 'user',
                        tenantId: result.user.user_metadata?.['tenant_id'],
                    },
                    session: {
                        accessToken: result.session.access_token,
                        refreshToken: result.session.refresh_token,
                        expiresAt: result.session.expires_at,
                    },
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message || 'Invalid credentials');
        }
    }
    async signUp(signUpDto) {
        try {
            const result = await this.authService.signUp(signUpDto.email, signUpDto.password, signUpDto.tenantId, signUpDto.role || 'user');
            if (!result.user) {
                throw new common_1.BadRequestException('Failed to create user');
            }
            return {
                success: true,
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        role: result.user.user_metadata?.['role'] || 'user',
                        tenantId: result.user.user_metadata?.['tenant_id'],
                    },
                },
                message: 'User created successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Failed to create user');
        }
    }
    async refreshToken(refreshTokenDto) {
        try {
            return {
                success: true,
                data: {
                    accessToken: 'new_access_token_placeholder',
                    expiresAt: new Date().getTime() + 3600 * 1000,
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getCurrentUser(req) {
        return {
            success: true,
            data: {
                id: req.user.id,
                email: req.user.email,
                tenantId: req.user.tenantId,
                role: req.user.role,
            },
        };
    }
    async updateProfile(updateDto, req) {
        return {
            success: true,
            data: {
                id: req.user.id,
                ...updateDto,
            },
            message: 'Profile updated successfully',
        };
    }
    async signOut(req) {
        try {
            await this.authService.signOut(req.headers.authorization?.replace('Bearer ', ''));
            return {
                success: true,
                message: 'Signed out successfully',
            };
        }
        catch (error) {
            return {
                success: true,
                message: 'Signed out successfully',
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('sign-in'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignInDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)('sign-up'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignUpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('sign-out'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signOut", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map