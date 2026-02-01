import { SupabaseClient } from '@supabase/supabase-js';
export interface AuthenticatedUser {
    id: string;
    email: string;
    tenantId: string;
    role: string;
}
export declare class AuthService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
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
