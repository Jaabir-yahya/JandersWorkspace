import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService, AuthenticatedUser } from './auth.service';

/**
 * Authentication guard that validates JWT tokens from the Authorization header
 * and attaches the authenticated user to the request.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    try {
      const user = await this.authService.verifyToken(token);
      // Attach user to request for use in controllers
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }
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
