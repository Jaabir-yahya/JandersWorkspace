import { ConfigService } from '@nestjs/config';
export declare const SUPABASE_AUTH_CLIENT = "SUPABASE_AUTH_CLIENT";
export interface AuthenticatedUser {
    id: string;
    email: string;
    tenantId: string;
    role: string;
}
export declare class AuthService {
    private readonly configService;
    private readonly supabase;
    constructor(configService: ConfigService);
    verifyToken(token: string): Promise<AuthenticatedUser>;
    getUserById(userId: string): Promise<import("@supabase/supabase-js").AuthUser>;
    signIn(email: string, password: string): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
        session: import("@supabase/supabase-js").AuthSession;
        weakPassword?: import("@supabase/supabase-js").WeakPassword;
    }>;
    signUp(email: string, password: string, tenantId: string, role?: string): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
    }>;
    signOut(token: string): Promise<{
        success: boolean;
    }>;
}
