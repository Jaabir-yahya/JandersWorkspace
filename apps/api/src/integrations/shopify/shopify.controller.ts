import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  Headers,
  Logger,
} from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import type { ShopifyConfig, ShopifyOrder } from '../types/integration.types';

@Controller('api/v1/integrations/shopify')
export class ShopifyController {
  private readonly logger = new Logger(ShopifyController.name);

  constructor(private readonly shopifyService: ShopifyService) {}

  @Post('auth/install')
  @HttpCode(HttpStatus.OK)
  async initiateInstall(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Implement OAuth installation flow
    // This would redirect to Shopify OAuth flow

    return {
      success: true,
      message: 'Installation initiated',
      tenantId,
      installUrl: 'https://apps.shopify.com/your-app',
    };
  }

  @Post('auth/callback')
  @HttpCode(HttpStatus.OK)
  async handleAuthCallback(
    @Request() req: any,
    @Body() body: { shop: string; code: string },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Exchange authorization code for access token

    return {
      success: true,
      message: 'Authentication successful',
      tenantId,
      shop: body.shop,
    };
  }

  @Get('orders')
  async getOrders(
    @Request() req: any,
    @Query() query: {
      status?: 'open' | 'closed' | 'cancelled' | 'any';
      financial_status?: string;
      fulfillment_status?: string;
      created_at_min?: string;
      created_at_max?: string;
      limit?: number;
    },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.getOrders(config, {
      status: query.status,
      financialStatus: query.financial_status as
        | 'pending'
        | 'authorized'
        | 'partially_paid'
        | 'paid'
        | 'partially_refunded'
        | 'refunded'
        | 'voided'
        | undefined,
      fulfillmentStatus: query.fulfillment_status as
        | 'shipped'
        | 'partial'
        | 'unshipped'
        | 'any'
        | undefined,
      createdAtMin: query.created_at_min,
      createdAtMax: query.created_at_max,
      limit: query.limit,
    });

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Get('orders/:id')
  async getOrder(@Request() req: any, @Param('id') orderId: string) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.getOrder(config, parseInt(orderId, 10));

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Request() req: any,
    @Body() order: Partial<ShopifyOrder>,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.createOrder(config, order);

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('orders/:id')
  @HttpCode(HttpStatus.OK)
  async updateOrder(
    @Request() req: any,
    @Param('id') orderId: string,
    @Body() order: Partial<ShopifyOrder>,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.updateOrder(
      config,
      parseInt(orderId, 10),
      order,
    );

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Request() req: any,
    @Param('id') orderId: string,
    @Body() body: {
      amount?: number;
      currency?: string;
      reason?: 'customer' | 'inventory' | 'fraud' | 'declined' | 'other';
      email?: boolean;
      refund?: boolean;
    },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.cancelOrder(
      config,
      parseInt(orderId, 10),
      body,
    );

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Get('products')
  async getProducts(
    @Request() req: any,
    @Query() query: {
      limit?: number;
      collection_id?: number;
      product_type?: string;
      vendor?: string;
    },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.getProducts(config, {
      limit: query.limit,
      collectionId: query.collection_id,
      productType: query.product_type,
      vendor: query.vendor,
    });

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Get('customers/:id')
  async getCustomer(@Request() req: any, @Param('id') customerId: string) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.getCustomer(config, parseInt(customerId, 10));

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('customers')
  @HttpCode(HttpStatus.CREATED)
  async createCustomer(
    @Request() req: any,
    @Body() customer: any,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Shopify config from tenant configuration
    const config: ShopifyConfig = {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2024-01',
    };

    const result = await this.shopifyService.createCustomer(config, customer);

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('sync/bulk')
  @HttpCode(HttpStatus.OK)
  async syncBulk(
    @Request() req: any,
    @Body() body: { dataType: 'TRANSACTIONS' | 'ENTITIES' | 'PAYMENTS' },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    const result = await this.shopifyService.syncData({
      tenantId,
      type: 'OUTBOUND',
      dataType: body.dataType,
    });

    return {
      success: result.success,
      data: result,
      tenantId,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
    @Headers('x-shopify-topic') topic: string,
  ) {
    // TODO: Verify webhook signature
    // const config = await getShopifyConfig(shopDomain);
    // const isValid = await this.shopifyService.verifyWebhook(config, hmac, JSON.stringify(payload));

    this.logger.debug(`Received Shopify webhook: ${topic} from ${shopDomain}`);

    const result = await this.shopifyService.handleWebhook(payload);
    return result;
  }

  @Get('health')
  async getHealthStatus() {
    const health = await this.shopifyService.getHealthStatus();
    return {
      service: this.shopifyService.name,
      ...health,
    };
  }
}
