import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_AUTH_CLIENT } from './auth.module';

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_AUTH_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  /**
   * Verify a JWT token and return the authenticated user
   */
  async verifyToken(token: string): Promise<AuthenticatedUser> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Extract tenant_id from user metadata
    const tenantId = user.user_metadata?.['tenant_id'];
    const role = user.user_metadata?.['role'] || 'user';

    if (!tenantId) {
      throw new UnauthorizedException('User is not associated with a tenant');
    }

    return {
      id: user.id,
      email: user.email || '',
      tenantId,
      role,
    };
  }

  /**
   * Get user by ID (for internal use)
   */
  async getUserById(userId: string) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.admin.getUserById(userId);

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  /**
   * Sign up a new user
   */
  async signUp(
    email: string,
    password: string,
    tenantId: string,
    role: string = 'user',
  ) {
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
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  /**
   * Sign out a user
   */
  async signOut(token: string) {
    const { error } = await this.supabase.auth.admin.signOut(token);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { success: true };
  }
}
