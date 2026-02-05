import { ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
export declare class AuthGuard {
    private readonly authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export interface AuthenticatedUser {
    id: string;
    email: string;
    tenantId: string;
    role: string;
}
export declare function getAuthenticatedUser(request: any): AuthenticatedUser;
