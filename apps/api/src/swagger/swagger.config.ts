import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

/**
 * Swagger/OpenAPI configuration for Project Bridge API
 * Provides API documentation with grouped modules and authentication
 */

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Project Bridge API')
  .setDescription(
    'African Informal Economy Ledger - Headless Truth Ledger API\n\n' +
    '## Authentication\n\n' +
    'This API uses JWT Bearer tokens for authentication. ' +
    'Include the token in the Authorization header as: `Bearer <token>`\n\n' +
    '## Modules\n\n' +
    '- **Transactions**: Core transaction management and posting\n' +
    '- **Entities**: Customer and vendor management\n' +
    '- **Payment Records**: Payment tracking and reconciliation\n' +
    '- **Integrations**: Third-party service integrations (M-Pesa, WhatsApp, QuickBooks, Xero, Shopify)\n' +
    '- **Webhooks**: Webhook configuration and event handling\n' +
    '- **Attachments**: File attachments and document management\n' +
    '- **Dashboard**: Analytics and reporting\n' +
    '- **Health**: System health checks'
  )
  .setVersion('1.0.0')
  .setContact(
    'Project Bridge Team',
    'https://project-bridge.app',
    'support@project-bridge.app'
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:3000/api/v1', 'Local Development')
  .addServer('https://api.project-bridge.app/api/v1', 'Production')
  .addServer('https://api-staging.project-bridge.app/api/v1', 'Staging')
  // Bearer authentication
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth' // This is the key name for the security scheme
  )
  // API Key authentication for webhooks
  .addApiKey(
    {
      type: 'apiKey',
      in: 'header',
      name: 'X-Webhook-Secret',
      description: 'Webhook secret for verifying webhook requests',
    },
    'Webhook-Secret'
  )
  // Add tags for grouping
  .addTag('Authentication', 'User authentication and authorization')
  .addTag('Transactions', 'Transaction management and posting')
  .addTag('Entities', 'Customer and vendor management')
  .addTag('Payment Records', 'Payment tracking and reconciliation')
  .addTag('Integrations', 'Third-party service integrations')
  .addTag('M-Pesa', 'M-Pesa mobile money integration')
  .addTag('WhatsApp', 'WhatsApp Business API integration')
  .addTag('QuickBooks', 'QuickBooks Online integration')
  .addTag('Xero', 'Xero Accounting integration')
  .addTag('Shopify', 'Shopify e-commerce integration')
  .addTag('Webhooks', 'Webhook configuration and events')
  .addTag('Attachments', 'File attachments and documents')
  .addTag('Dashboard', 'Analytics and reporting')
  .addTag('Health', 'System health checks')
  .build();

/**
 * Swagger document options for customizing the generated documentation
 */
export const swaggerDocumentOptions: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) =>
    `${controllerKey.replace('Controller', '')}_${methodKey}`,
  deepScanRoutes: true,
};

/**
 * Custom CSS for Swagger UI
 */
export const swaggerCustomCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info { margin: 20px 0 }
  .swagger-ui .scheme-container { background: #f8f9fa }
  .swagger-ui .opblock-tag { font-size: 20px }
  .swagger-ui .opblock .opblock-summary-operation-id { font-size: 14px }
`;

/**
 * Swagger UI custom options
 */
export const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayOperationId: true,
    displayRequestDuration: true,
  },
  customCss: swaggerCustomCss,
  customSiteTitle: 'Project Bridge API Documentation',
  customfavIcon: '/favicon.ico',
};
