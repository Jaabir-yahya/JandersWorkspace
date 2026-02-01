import { SwaggerDocumentOptions } from '@nestjs/swagger';
export declare const swaggerConfig: Omit<import("@nestjs/swagger").OpenAPIObject, "paths">;
export declare const swaggerDocumentOptions: SwaggerDocumentOptions;
export declare const swaggerCustomCss = "\n  .swagger-ui .topbar { display: none }\n  .swagger-ui .info { margin: 20px 0 }\n  .swagger-ui .scheme-container { background: #f8f9fa }\n  .swagger-ui .opblock-tag { font-size: 20px }\n  .swagger-ui .opblock .opblock-summary-operation-id { font-size: 14px }\n";
export declare const swaggerUiOptions: {
    explorer: boolean;
    swaggerOptions: {
        persistAuthorization: boolean;
        docExpansion: string;
        filter: boolean;
        showRequestDuration: boolean;
        tryItOutEnabled: boolean;
        supportedSubmitMethods: string[];
        defaultModelsExpandDepth: number;
        defaultModelExpandDepth: number;
        displayOperationId: boolean;
        displayRequestDuration: boolean;
    };
    customCss: string;
    customSiteTitle: string;
    customfavIcon: string;
};
