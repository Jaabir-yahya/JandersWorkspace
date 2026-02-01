"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiOptions = exports.swaggerCustomCss = exports.swaggerDocumentOptions = exports.swaggerConfig = void 0;
const swagger_1 = require("@nestjs/swagger");
exports.swaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('Project Bridge API')
    .setDescription('African Informal Economy Ledger - Headless Truth Ledger API\n\n' +
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
    '- **Health**: System health checks')
    .setVersion('1.0.0')
    .setContact('Project Bridge Team', 'https://project-bridge.app', 'support@project-bridge.app')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000/api/v1', 'Local Development')
    .addServer('https://api.project-bridge.app/api/v1', 'Production')
    .addServer('https://api-staging.project-bridge.app/api/v1', 'Staging')
    .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter JWT token',
    in: 'header',
}, 'JWT-auth')
    .addApiKey({
    type: 'apiKey',
    in: 'header',
    name: 'X-Webhook-Secret',
    description: 'Webhook secret for verifying webhook requests',
}, 'Webhook-Secret')
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
exports.swaggerDocumentOptions = {
    operationIdFactory: (controllerKey, methodKey) => `${controllerKey.replace('Controller', '')}_${methodKey}`,
    deepScanRoutes: true,
};
exports.swaggerCustomCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info { margin: 20px 0 }
  .swagger-ui .scheme-container { background: #f8f9fa }
  .swagger-ui .opblock-tag { font-size: 20px }
  .swagger-ui .opblock .opblock-summary-operation-id { font-size: 14px }
`;
exports.swaggerUiOptions = {
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
    customCss: exports.swaggerCustomCss,
    customSiteTitle: 'Project Bridge API Documentation',
    customfavIcon: '/favicon.ico',
};
//# sourceMappingURL=swagger.config.js.map