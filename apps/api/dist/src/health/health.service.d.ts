import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
export declare class HealthService {
    private readonly configService;
    private readonly prismaService;
    private readonly logger;
    private readonly startTime;
    private readonly supabaseClient;
    constructor(configService: ConfigService, prismaService: PrismaService);
    getBasicHealth(): {
        status: string;
        timestamp: string;
    };
    getDetailedHealth(): Promise<HealthCheckResult>;
    getReadiness(): Promise<ReadinessCheckResult>;
    getLiveness(): LivenessCheckResult;
    private checkDatabase;
    private checkSupabase;
    private checkMemory;
    private checkIntegrations;
    private checkWhatsAppHealth;
    private checkMpesaHealth;
    private isDatabaseReady;
    private isSupabaseReady;
    private areRequiredEnvVarsSet;
}
