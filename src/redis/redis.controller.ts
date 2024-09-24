import { Controller, Get, Param } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class CacheController {
  constructor(private readonly redisService: RedisService) {}

  @Get(':key')
  async get(@Param('key') key: string): Promise<string> {
    return this.redisService.getValue(key);
  }

  @Get(':key/:value')
  async set(
    @Param('key') key: string,
    @Param('value') value: string,
  ): Promise<void> {
    await this.redisService.setValue(key, value);
  }
}
