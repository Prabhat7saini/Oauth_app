import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Create the main Nest application
  const app = await NestFactory.create(AppModule);

  // Use cookie parser
  app.use(cookieParser());

  // Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Get the configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000; // Default to port 3000 if not set

  // Set global prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // Start the application
  await app.listen(port);
  console.log(`HTTP server running on http://localhost:${port}`);
}

bootstrap();
