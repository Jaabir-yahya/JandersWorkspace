import { Module, Global } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

export const SUPABASE_AUTH_CLIENT = 'SUPABASE_AUTH_CLIENT';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: SUPABASE_AUTH_CLIENT,
      useFactory: (): SupabaseClient => {
        const url = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    },
    AuthService,
    AuthGuard,
  ],
  exports: [SUPABASE_AUTH_CLIENT, AuthService, AuthGuard],
})
export class AuthModule {}
