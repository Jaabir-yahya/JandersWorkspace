import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check endpoint
   * Returns 200 if the server is up and running
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return this.healthService.getBasicHealth();
  }

  /**
   * Detailed health check endpoint
   * Returns comprehensive health status including database, Supabase,
   * memory usage, and integration services
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  async getDetailedHealth() {
    return this.healthService.getDetailedHealth();
  }

  /**
   * Kubernetes-style readiness probe
   * Returns 200 if the application is ready to serve traffic
   * Returns 503 if the application is not ready
   */
  @Get('ready')
  async getReadiness() {
    const result = await this.healthService.getReadiness();

    if (!result.ready) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        ...result,
      };
    }

    return result;
  }

  /**
   * Kubernetes-style liveness probe
   * Returns 200 if the application is alive
   * Returns 503 if the application should be restarted
   */
  @Get('live')
  getLiveness() {
    const result = this.healthService.getLiveness();

    if (!result.alive) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        ...result,
      };
    }

    return result;
  }
}
