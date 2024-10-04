import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheController } from './redis.controller';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule], // Import ConfigModule
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        });

        redis.on('error', (err) => {
          console.error('Redis error:', err);
        });

        return redis;
      },
      inject: [ConfigService], // Specify ConfigService as a dependency
    },
    RedisService,
  ],
  controllers: [CacheController],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
