import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    // For now, accept any API key (implement proper tenant lookup later)
    // In production, validate against database tenant integrations

    // Attach tenant info to request for downstream use
    (request as any).tenant = {
      id: 'temp-tenant-id', // TODO: Lookup from API key
      validated: true,
    };

    return true;
  }
}
