import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';
import { ConfigService } from '@nestjs/config';

/**
 * Supabase Auth Strategy for NestJS
 *
 * This strategy validates JWT tokens issued by Supabase Auth
 * and extracts user information from the token payload.
 */
@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  'supabase',
) {
  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_SECRET_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SECRET_KEY must be set',
      );
    }

    super({
      supabaseUrl,
      supabaseKey,
      supabaseOptions: {},
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  validate(payload: any): any {
    // The payload from Supabase contains the user data
    // Extract tenant_id and role from user metadata
    const tenantId = payload.user_metadata?.['tenant_id'];
    const role = payload.user_metadata?.['role'] || 'user';

    // Return the user with additional tenant information
    return {
      id: payload.sub,
      email: payload.email,
      tenantId,
      role,
      user_metadata: payload.user_metadata,
    };
  }
}
