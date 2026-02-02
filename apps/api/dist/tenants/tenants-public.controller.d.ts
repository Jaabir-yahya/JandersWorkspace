import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsPublicController {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    getTenantBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        tier: string;
        country: string;
        settings: {
            businessType: any;
            location: any;
            features: any;
        };
        features: any;
    }>;
}
