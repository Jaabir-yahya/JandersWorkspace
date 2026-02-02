import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService, AuthenticatedUser } from './auth.service';
export declare class AuthGuard implements CanActivate {
    private readonly authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
export declare function getAuthenticatedUser(request: any): AuthenticatedUser;
