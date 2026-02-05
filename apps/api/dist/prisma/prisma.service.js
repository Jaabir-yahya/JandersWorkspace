"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@project-bridge/database");
let PrismaService = PrismaService_1 = class PrismaService extends database_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        const connectionUrl = databaseUrl?.includes('?')
            ? `${databaseUrl}&pgbouncer=true`
            : `${databaseUrl}?pgbouncer=true`;
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
            datasourceUrl: connectionUrl,
        });
        this.$on('query', (e) => {
            this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
        });
    }
    async onModuleInit() {
        this.logger.log('Connecting to database...');
        await this.$connect();
        this.logger.log('Database connected successfully');
    }
    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }
        const tablenames = await this.$queryRaw `SELECT tablename FROM pg_tables WHERE schemaname='public'`;
        const tables = tablenames
            .map(({ tablename }) => tablename)
            .filter((name) => name !== '_prisma_migrations');
        for (const table of tables) {
            await this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map