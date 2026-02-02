import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@project-bridge/database';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    cleanDatabase(): Promise<void>;
}
