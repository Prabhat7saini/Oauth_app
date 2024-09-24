import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}
  async getValue(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async setValue(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }
  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
