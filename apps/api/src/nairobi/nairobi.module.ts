/**
 * Nairobi Module
 * Features specific to Nairobi manual users
 */

import { Module } from '@nestjs/common';
import { NairobiSmsService } from './sms.service';
import { NairobiSmsController } from './sms.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [NairobiSmsController],
  providers: [NairobiSmsService, PrismaService],
  exports: [NairobiSmsService],
})
export class NairobiModule {}
