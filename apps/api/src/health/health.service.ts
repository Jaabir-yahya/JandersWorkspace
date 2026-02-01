import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckDetail;
    supabase: HealthCheckDetail;
    memory: HealthCheckDetail;
    integrations: IntegrationHealthCheck;
  };
}

export interface HealthCheckDetail {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
}

export interface IntegrationHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    whatsapp: HealthCheckDetail;
    mpesa: HealthCheckDetail;
  };
}

export interface ReadinessCheckResult {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    supabase: boolean;
    requiredEnvVars: boolean;
  };
}

export interface LivenessCheckResult {
  alive: boolean;
  timestamp: string;
  uptime: number;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime: number;
  private readonly supabaseClient: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.startTime = Date.now();
    
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (url && serviceRoleKey) {
      this.supabaseClient = createClient(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }

  /**
   * Basic health check - returns 200 if server is up
   */
  getBasicHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Detailed health check with all service statuses
   */
  async getDetailedHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    const [databaseCheck, supabaseCheck, memoryCheck, integrationCheck] =
      await Promise.all([
        this.checkDatabase(),
        this.checkSupabase(),
        this.checkMemory(),
        this.checkIntegrations(),
      ]);

    // Determine overall status
    const checks = [databaseCheck, supabaseCheck, memoryCheck];
    const hasUnhealthy = checks.some((c) => c.status === 'unhealthy');
    const hasDegraded = checks.some((c) => c.status === 'degraded');
    const overallStatus = hasUnhealthy
      ? 'unhealthy'
      : hasDegraded
        ? 'degraded'
        : 'healthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV') || 'development',
      checks: {
        database: databaseCheck,
        supabase: supabaseCheck,
        memory: memoryCheck,
        integrations: integrationCheck,
      },
    };
  }

  /**
   * Kubernetes-style readiness probe
   * Checks if the application is ready to serve traffic
   */
  async getReadiness(): Promise<ReadinessCheckResult> {
    const [databaseHealthy, supabaseHealthy, envVarsHealthy] =
      await Promise.all([
        this.isDatabaseReady(),
        this.isSupabaseReady(),
        this.areRequiredEnvVarsSet(),
      ]);

    const ready = databaseHealthy && supabaseHealthy && envVarsHealthy;

    return {
      ready,
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseHealthy,
        supabase: supabaseHealthy,
        requiredEnvVars: envVarsHealthy,
      },
    };
  }

  /**
   * Kubernetes-style liveness probe
   * Checks if the application is alive and should be restarted
   */
  getLiveness(): LivenessCheckResult {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<HealthCheckDetail> {
    const startTime = Date.now();

    try {
      // Simple query to check database connectivity
      await this.prismaService.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'Database connection is healthy',
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);

      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Database connection failed',
        details: { error: error.message },
      };
    }
  }

  /**
   * Check Supabase connectivity
   */
  private async checkSupabase(): Promise<HealthCheckDetail> {
    const startTime = Date.now();

    if (!this.supabaseClient) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Supabase client not initialized - missing environment variables',
      };
    }

    try {
      // Try to get session to verify Supabase is accessible
      const { data, error } = await this.supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'Supabase connection is healthy',
      };
    } catch (error) {
      this.logger.error('Supabase health check failed:', error);

      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Supabase connection failed',
        details: { error: error.message },
      };
    }
  }

  /**
   * Check memory usage
   */
  private checkMemory(): HealthCheckDetail {
    const startTime = Date.now();
    const usage = process.memoryUsage();
    const maxMemory = 1024 * 1024 * 1024; // 1GB threshold
    const usedMemory = usage.heapUsed;
    const memoryPercent = (usedMemory / maxMemory) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'Memory usage is normal';

    if (memoryPercent > 90) {
      status = 'unhealthy';
      message = 'Memory usage is critically high';
    } else if (memoryPercent > 75) {
      status = 'degraded';
      message = 'Memory usage is high';
    }

    return {
      status,
      responseTime: Date.now() - startTime,
      message,
      details: {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`,
        percentage: `${Math.round(memoryPercent)}%`,
      },
    };
  }

  /**
   * Check integration services health
   */
  private async checkIntegrations(): Promise<IntegrationHealthCheck> {
    const startTime = Date.now();

    // Check WhatsApp credentials
    const whatsappCheck = await this.checkWhatsAppHealth();

    // Check M-Pesa credentials
    const mpesaCheck = await this.checkMpesaHealth();

    const hasUnhealthy =
      whatsappCheck.status === 'unhealthy' || mpesaCheck.status === 'unhealthy';
    const hasDegraded =
      whatsappCheck.status === 'degraded' || mpesaCheck.status === 'degraded';

    const status = hasUnhealthy
      ? 'unhealthy'
      : hasDegraded
        ? 'degraded'
        : 'healthy';

    return {
      status,
      services: {
        whatsapp: whatsappCheck,
        mpesa: mpesaCheck,
      },
    };
  }

  /**
   * Check WhatsApp service health
   */
  private async checkWhatsAppHealth(): Promise<HealthCheckDetail> {
    const startTime = Date.now();

    try {
      const phoneNumberId = this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
      const accessToken = this.configService.get('WHATSAPP_ACCESS_TOKEN');
      const verifyToken = this.configService.get('WHATSAPP_VERIFY_TOKEN');

      if (!phoneNumberId || !accessToken || !verifyToken) {
        return {
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: 'WhatsApp credentials not configured',
          details: {
            hasPhoneNumberId: !!phoneNumberId,
            hasAccessToken: !!accessToken,
            hasVerifyToken: !!verifyToken,
          },
        };
      }

      // Optionally, we could make a test API call to WhatsApp here
      // For now, just verify credentials are present

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'WhatsApp credentials configured',
        details: {
          phoneNumberId: phoneNumberId.substring(0, 4) + '...',
        },
      };
    } catch (error) {
      this.logger.error('WhatsApp health check failed:', error);

      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'WhatsApp health check failed',
        details: { error: error.message },
      };
    }
  }

  /**
   * Check M-Pesa service health
   */
  private async checkMpesaHealth(): Promise<HealthCheckDetail> {
    const startTime = Date.now();

    try {
      const consumerKey = this.configService.get('MPESA_CONSUMER_KEY');
      const consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET');
      const passkey = this.configService.get('MPESA_PASSKEY');
      const environment = this.configService.get('MPESA_ENVIRONMENT');

      if (!consumerKey || !consumerSecret || !passkey) {
        return {
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: 'M-Pesa credentials not fully configured',
          details: {
            hasConsumerKey: !!consumerKey,
            hasConsumerSecret: !!consumerSecret,
            hasPasskey: !!passkey,
            environment: environment || 'not set',
          },
        };
      }

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'M-Pesa credentials configured',
        details: {
          environment: environment || 'sandbox',
          hasConsumerKey: true,
        },
      };
    } catch (error) {
      this.logger.error('M-Pesa health check failed:', error);

      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'M-Pesa health check failed',
        details: { error: error.message },
      };
    }
  }

  /**
   * Check if database is ready (for readiness probe)
   */
  private async isDatabaseReady(): Promise<boolean> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Supabase is ready (for readiness probe)
   */
  private async isSupabaseReady(): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient.auth.getSession();
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Check if required environment variables are set
   */
  private areRequiredEnvVarsSet(): boolean {
    const required = [
      'DATABASE_URL',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    return required.every((key) => !!this.configService.get(key));
  }
}
