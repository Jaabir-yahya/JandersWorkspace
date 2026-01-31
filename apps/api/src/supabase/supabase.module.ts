import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (configService: ConfigService): SupabaseClient => {
        const url =
          configService.get<string>('SUPABASE_URL') || 'http://127.0.0.1:54321';
        const key =
          configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
          configService.get<string>('SUPABASE_SECRET_KEY') ||
          configService.get<string>('SUPABASE_ANON_KEY') ||
          '';

        return createClient(url, key, {
          auth: { persistSession: false },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
