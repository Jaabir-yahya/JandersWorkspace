import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [ConfigModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
