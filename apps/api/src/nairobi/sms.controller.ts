/**
 * Nairobi SMS Controller
 * Handles SMS webhooks and commands for manual users
 */

import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { NairobiSmsService, SmsSummary } from './sms.service';

export interface SmsWebhookDto {
  from: string;
  to: string;
  text: string;
  timestamp: string;
}

@Controller('nairobi/sms')
export class NairobiSmsController {
  constructor(private readonly smsService: NairobiSmsService) {}

  /**
   * Receive incoming SMS from provider
   */
  @Post('webhook')
  async handleIncomingSms(@Body() smsData: SmsWebhookDto) {
    try {
      const response = await this.smsService.handleSmsCommand(
        smsData.from,
        smsData.text,
      );

      return {
        status: 'success',
        response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Send test SMS (development only)
   */
  @Post('test')
  async sendTestSms(@Body() body: { phoneNumber: string; tenantId: string }) {
    try {
      const summary = await this.smsService.generateDailySummary(body.tenantId);
      const result = await this.smsService.sendSms({
        ...summary,
        phoneNumber: body.phoneNumber,
      });

      return {
        status: 'success',
        sent: result,
        message: summary.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Send daily summaries to all tenants (cron endpoint)
   */
  @Post('send-daily-summaries')
  async sendDailySummaries() {
    try {
      await this.smsService.sendDailySummaries();
      return {
        status: 'success',
        message: 'Daily summaries sent successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get SMS webhook configuration
   */
  @Get('webhook-config')
  async getWebhookConfig() {
    return this.smsService.setupSmsWebhook();
  }

  /**
   * Generate SMS summary for specific tenant
   */
  @Get('summary')
  async generateSummary(@Query('tenantId') tenantId: string) {
    try {
      const summary = await this.smsService.generateDailySummary(tenantId);
      return {
        status: 'success',
        data: summary,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
