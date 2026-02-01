import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IIntegrationService, IntegrationConfig, SyncRequest, SyncResult, WebhookResult, HealthStatus, IntegrationType, TenantTier, TenantCountry } from '../types/integration.types';
export declare abstract class BaseIntegrationService implements IIntegrationService, OnModuleInit {
    protected readonly configService: ConfigService;
    protected readonly logger: Logger;
    constructor(configService: ConfigService);
    abstract name: string;
    abstract type: IntegrationType;
    abstract country: TenantCountry;
    abstract tier: TenantTier;
    onModuleInit(): Promise<void>;
    protected initialize(): Promise<void>;
    abstract authenticate(config: IntegrationConfig): Promise<boolean>;
    testConnection(config: IntegrationConfig): Promise<boolean>;
    abstract syncData(request: SyncRequest): Promise<SyncResult>;
    abstract handleWebhook(payload: any): Promise<WebhookResult>;
    getHealthStatus(): Promise<HealthStatus>;
    protected performHealthCheck(): Promise<boolean>;
    protected handleError(error: any, code: string): never;
    protected validateTenantTier(config: IntegrationConfig): void;
    protected sanitizeConfig(config: IntegrationConfig): Record<string, any>;
    protected generateCorrelationId(): string;
}
