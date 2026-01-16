import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config/app-config.service';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule);

    // Get config service
    const configService = app.get(AppConfigService);

    // Enable CORS
    app.enableCors({
        origin: true,
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Swagger documentation
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Delivery Service API')
        .setDescription(
            'A modular monolith delivery service system with Clean Architecture, CQRS, and Event-Driven patterns',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Health', 'Health check endpoints')
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Customers', 'Customer management')
        .addTag('Restaurants', 'Restaurant and menu management')
        .addTag('Menu Items', 'Menu item management')
        .addTag('Drivers', 'Driver management')
        .addTag('Carts', 'Shopping cart operations')
        .addTag('Orders', 'Order management and delivery')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    // Start server
    const port = configService.port;
    const host = configService.host;

    await app.listen(port, host);

    logger.log(`Application is running on: http://${host}:${port}`);
    logger.log(`Swagger documentation: http://${host}:${port}/api/docs`);
}

bootstrap();
