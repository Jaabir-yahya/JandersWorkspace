import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

export const SUPABASE_AUTH_CLIENT = 'SUPABASE_AUTH_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_AUTH_CLIENT,
      useFactory: (configService: ConfigService): SupabaseClient => {
        const url = configService.get<string>('SUPABASE_URL');
        const serviceRoleKey = configService.get<string>(
          'SUPABASE_SERVICE_ROLE_KEY',
        );

        if (!url || !serviceRoleKey) {
          throw new Error(
            'Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
          );
        }

        return createClient(url, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
      },
      inject: [ConfigService],
    },
    AuthService,
    AuthGuard,
  ],
  exports: [SUPABASE_AUTH_CLIENT, AuthService, AuthGuard],
})
export class AuthModule {}
