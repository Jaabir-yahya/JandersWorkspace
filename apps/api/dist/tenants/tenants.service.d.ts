import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    static hashKey(plainKey: string): string;
    validateTenantKey(tenantId: string, plainKey: string | undefined): Promise<boolean>;
    assertTenantKeyIfPresent(tenantId: string, plainKey: string | undefined): Promise<void>;
    setTenantApiKey(tenantId: string, plainKey: string): Promise<void>;
    getTenantIdsForUser(userEmail: string): Promise<string[]>;
    resolveEffectiveTenantId(jwtTenantId: string | undefined, headerTenantId: string | undefined, userEmail: string): Promise<string | null>;
}
