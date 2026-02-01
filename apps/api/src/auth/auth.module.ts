import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { AuthService, SUPABASE_AUTH_CLIENT } from './auth.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    AuthService,
    AuthGuard,
  ],
  exports: [SUPABASE_AUTH_CLIENT, AuthService, AuthGuard],
})
export class AuthModule {}
