import { AuthService } from './auth.service';
export declare class SignInDto {
    email: string;
    password: string;
}
export declare class SignUpDto {
    email: string;
    password: string;
    tenantId: string;
    role?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class UpdateProfileDto {
    displayName?: string;
    phoneNumber?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signIn(signInDto: SignInDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                email: string | undefined;
                displayName: any;
                role: any;
                tenantId: any;
            };
            session: {
                accessToken: string;
                refreshToken: string;
                expiresAt: number | undefined;
            };
        };
    }>;
    signUp(signUpDto: SignUpDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                email: string | undefined;
                role: any;
                tenantId: any;
            };
        };
        message: string;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            expiresAt: number;
        };
    }>;
    getCurrentUser(req: any): Promise<{
        success: boolean;
        data: {
            id: any;
            email: any;
            tenantId: any;
            role: any;
        };
    }>;
    updateProfile(updateDto: UpdateProfileDto, req: any): Promise<{
        success: boolean;
        data: {
            displayName?: string;
            phoneNumber?: string;
            id: any;
        };
        message: string;
    }>;
    signOut(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
