import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IIntegrationService,
  IntegrationConfig,
  SyncRequest,
  SyncResult,
  WebhookResult,
  HealthStatus,
  IntegrationType,
  IntegrationError,
  TenantTier,
  TenantCountry,
} from '../types/integration.types';

@Injectable()
export abstract class BaseIntegrationService
  implements IIntegrationService, OnModuleInit
{
  protected readonly logger: Logger;

  constructor(protected readonly configService: ConfigService) {
    // Initialize logger with service name that will be provided by subclass
    this.logger = new Logger(this.constructor.name);
  }

  abstract name: string;
  abstract type: IntegrationType;
  abstract country: TenantCountry;
  abstract tier: TenantTier;

  async onModuleInit() {
    this.logger.log(`Initializing ${this.name} integration service`);
    await this.initialize();
  }

  protected async initialize(): Promise<void> {
    // Override in subclasses for specific initialization
  }

  abstract authenticate(config: IntegrationConfig): Promise<boolean>;

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      this.logger.debug(`Testing connection to ${this.name}`);
      return await this.authenticate(config);
    } catch (error) {
      this.logger.error(`Connection test failed for ${this.name}:`, error);
      return false;
    }
  }

  abstract syncData(request: SyncRequest): Promise<SyncResult>;

  abstract handleWebhook(payload: any): Promise<WebhookResult>;

  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      // Basic health check - can be overridden by subclasses
      const isHealthy = await this.performHealthCheck();
      const responseTime = Date.now() - startTime;

      return {
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        lastCheck: new Date(),
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'UNHEALTHY',
        lastCheck: new Date(),
        responseTime,
        errorMessage: error.message,
      };
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    // Override in subclasses for specific health checks
    return true;
  }

  protected handleError(error: any, code: string): never {
    this.logger.error(`Integration error in ${this.name}:`, error);

    if (error instanceof IntegrationError) {
      throw error;
    }

    throw new IntegrationError(
      this.type,
      code,
      error.message || 'Unknown integration error',
      error.details || error,
    );
  }

  protected validateTenantTier(config: IntegrationConfig): void {
    // This would typically check against the tenant's configured tier
    // For now, assume validation passes
    if (this.tier === TenantTier.ADVANCED) {
      // Advanced tier check
    }
  }

  protected sanitizeConfig(config: IntegrationConfig): Record<string, any> {
    // Remove sensitive data for logging
    const sanitized = { ...config.config };
    const sensitiveKeys = ['password', 'secret', 'token', 'key'];

    for (const key of Object.keys(sanitized)) {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  protected generateCorrelationId(): string {
    return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
