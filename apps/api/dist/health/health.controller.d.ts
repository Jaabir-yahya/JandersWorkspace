import { HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): {
        status: string;
        timestamp: string;
    };
    getDetailedHealth(): Promise<import("./health.service").HealthCheckResult>;
    getReadiness(): Promise<import("./health.service").ReadinessCheckResult | {
        ready: boolean;
        timestamp: string;
        checks: {
            database: boolean;
            supabase: boolean;
            requiredEnvVars: boolean;
        };
        statusCode: HttpStatus;
    }>;
    getLiveness(): import("./health.service").LivenessCheckResult | {
        alive: boolean;
        timestamp: string;
        uptime: number;
        statusCode: HttpStatus;
    };
}
