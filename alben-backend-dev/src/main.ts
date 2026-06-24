import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Registration moved to app.module.ts via APP_FILTER because of DI
  // app.useGlobalFilters(new AllExceptionsFilter());

  // Environment-based disabling and basic auth for Swagger & System Logs View
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      ['/api', '/api-json', '/system-logs-view'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER || 'admin']:
            process.env.SWAGGER_PASSWORD || '9sy8K06wTcTd',
        },
      }),
    );

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Alben Backend API')
      .setDescription('API documentation for Alben Backend')
      .setVersion('1.0')
      .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Local Server')
      .addServer(`https://dev.api.alben.io`, 'Development Server')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger UI available at: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
void bootstrap();
