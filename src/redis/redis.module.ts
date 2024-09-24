import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis'; // Import the default export
import { CacheController } from './redis.controller';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redis = new Redis({
          host: 'localhost', // Redis host
          port: 6379, // Redis port
          // password: 'your-password', // Uncomment if Redis is password protected
        });

        redis.on('error', (err) => {
          console.error('Redis error:', err);
        });

        return redis;
      },
    },
    RedisService,
  ],
  controllers: [CacheController],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
