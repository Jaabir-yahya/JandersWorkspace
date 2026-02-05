import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Authentication guard that validates JWT tokens from the Authorization header
 * using Supabase Auth directly (not Passport strategy which has issues).
 */
@Injectable()
export class AuthGuard {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const user = await this.authService.verifyToken(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

/**
 * Interface for authenticated user
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  role: string;
}

/**
 * Type guard to check if a request has an authenticated user
 */
export function getAuthenticatedUser(request: any): AuthenticatedUser {
  const user = request.user as AuthenticatedUser | undefined;
  if (!user) {
    throw new UnauthorizedException('User not authenticated');
  }
  return user;
}
