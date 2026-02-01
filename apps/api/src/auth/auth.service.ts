import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_AUTH_CLIENT = 'SUPABASE_AUTH_CLIENT';

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const secretKey = this.configService.get<string>('SUPABASE_SECRET_KEY');

    if (!url || !secretKey) {
      throw new Error(
        'Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SECRET_KEY must be set',
      );
    }

    this.supabase = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

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
