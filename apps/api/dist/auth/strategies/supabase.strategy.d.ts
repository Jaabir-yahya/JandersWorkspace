import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';
import { ConfigService } from '@nestjs/config';
declare const SupabaseStrategy_base: new (options: import("nestjs-supabase-auth").SupabaseAuthStrategyOptions) => SupabaseAuthStrategy & {
    validate(...args: any[]): unknown;
};
export declare class SupabaseStrategy extends SupabaseStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(payload: any): any;
}
export {};
