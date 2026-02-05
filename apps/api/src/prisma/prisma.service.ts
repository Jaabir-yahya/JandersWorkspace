import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@project-bridge/database/client';

/** Instance type of the generated Prisma client (for declaration merge so PrismaService is typed as full client). */
type PrismaClientInstance = InstanceType<typeof PrismaClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly prisma: PrismaClient;

  constructor() {
    // In Prisma 7, accelerateUrl is required for the client
    // We'll use the DATABASE_URL environment variable
    let databaseUrl = process.env.DATABASE_URL;

    // For test environment, use a mock URL if DATABASE_URL is not set
    if (!databaseUrl && process.env.NODE_ENV === 'test') {
      databaseUrl = 'postgresql://test:test@localhost:5432/test_db';
    }

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    this.prisma = new PrismaClient({
      accelerateUrl: databaseUrl,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    // Log queries in development
    this.prisma.$on('query' as never, (e: any) => {
      this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
    });
  }

  // Delegate all PrismaClient methods and model accessors (return type any for portable emit; Prisma internals are not portable)
  get $connect(): any {
    return this.prisma.$connect.bind(this.prisma);
  }

  get $disconnect(): any {
    return this.prisma.$disconnect.bind(this.prisma);
  }

  get $on(): any {
    return this.prisma.$on.bind(this.prisma);
  }

  get $queryRaw(): any {
    return this.prisma.$queryRaw.bind(this.prisma);
  }

  get $executeRawUnsafe(): any {
    return this.prisma.$executeRawUnsafe.bind(this.prisma);
  }

  get $transaction(): any {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get tenant(): any {
    return this.prisma.tenant;
  }

  get user(): any {
    return this.prisma.user;
  }

  get entity(): any {
    return this.prisma.entity;
  }

  get transaction(): any {
    return this.prisma.transaction;
  }

  get transactionLine(): any {
    return this.prisma.transactionLine;
  }

  get item(): any {
    return this.prisma.item;
  }

  get payment(): any {
    return this.prisma.payment;
  }

  get paymentApplication(): any {
    return this.prisma.paymentApplication;
  }

  get account(): any {
    return this.prisma.account;
  }

  get note(): any {
    return this.prisma.note;
  }

  get transactionReason(): any {
    return this.prisma.transactionReason;
  }

  get proof(): any {
    return this.prisma.proof;
  }

  get webhookEvent(): any {
    return this.prisma.webhookEvent;
  }

  get featureFlag(): any {
    return this.prisma.featureFlag;
  }

  get tenantIntegration(): any {
    return this.prisma.tenantIntegration;
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.prisma.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.prisma.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Clean up database - useful for testing
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations');

    for (const table of tables) {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  }
}

// PrismaService extends PrismaClient, so it has all the Prisma client methods
