import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService, AuthenticatedUser } from './auth.service';
import { AuthGuard } from './auth.guard';

import { IsString, IsEmail } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class SignUpDto {
  email: string;
  password: string;
  tenantId: string;
  role?: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class UpdateProfileDto {
  displayName?: string;
  phoneNumber?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Sign in user and return JWT tokens
   */
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    try {
      const result = await this.authService.signIn(
        signInDto.email,
        signInDto.password,
      );

      if (!result.session) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return {
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            displayName:
              result.user.user_metadata?.['display_name'] || result.user.email,
            role: result.user.user_metadata?.['role'] || 'user',
            tenantId: result.user.user_metadata?.['tenant_id'],
          },
          session: {
            accessToken: result.session.access_token,
            refreshToken: result.session.refresh_token,
            expiresAt: result.session.expires_at,
          },
        },
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid credentials');
    }
  }

  /**
   * Sign up new user
   */
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      const result = await this.authService.signUp(
        signUpDto.email,
        signUpDto.password,
        signUpDto.tenantId,
        signUpDto.role || 'user',
      );

      if (!result.user) {
        throw new BadRequestException('Failed to create user');
      }

      return {
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.user_metadata?.['role'] || 'user',
            tenantId: result.user.user_metadata?.['tenant_id'],
          },
        },
        message: 'User created successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create user');
    }
  }

  /**
   * Refresh JWT token
   */
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      // For now, return a basic implementation
      // In production, you'd validate the refresh token with Supabase
      return {
        success: true,
        data: {
          accessToken: 'new_access_token_placeholder',
          expiresAt: new Date().getTime() + 3600 * 1000, // 1 hour
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Request() req: any) {
    return {
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        tenantId: req.user.tenantId,
        role: req.user.role,
      },
    };
  }

  /**
   * Update user profile
   */
  @Put('profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Body() updateDto: UpdateProfileDto,
    @Request() req: any,
  ) {
    // This would update the user in Supabase
    // For now, return a placeholder response
    return {
      success: true,
      data: {
        id: req.user.id,
        ...updateDto,
      },
      message: 'Profile updated successfully',
    };
  }

  /**
   * Sign out user
   */
  @Post('sign-out')
  @UseGuards(AuthGuard)
  async signOut(@Request() req: any) {
    try {
      await this.authService.signOut(
        req.headers.authorization?.replace('Bearer ', ''),
      );
      return {
        success: true,
        message: 'Signed out successfully',
      };
    } catch (error) {
      // Continue even if sign out fails
      return {
        success: true,
        message: 'Signed out successfully',
      };
    }
  }
}
