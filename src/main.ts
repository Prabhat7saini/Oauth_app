import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP, // You can choose other transports like Redis, NATS, etc.
      options: {
        host: 'localhost',
        port: 3001, // Specify a port for the microservice
      },
    },
  );

  // If you still want to use an HTTP server for certain endpoints, create another app instance
  const httpApp = await NestFactory.create(AppModule);
  httpApp.use(cookieParser());
  httpApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const configService = httpApp.get(ConfigService);
  const port = configService.get<number>('PORT');
  httpApp.setGlobalPrefix('api');
  httpApp.enableVersioning({ type: VersioningType.URI });

  // Start the microservice and the HTTP server
  await app.listen();
  await httpApp.listen(port);

  console.log(`Microservice is running on tcp://localhost:3001`);
  console.log(`HTTP server running on http://localhost:${port}`);
}

bootstrap();
