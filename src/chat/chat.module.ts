import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { ChatRepository } from './repo/chat.repository';
import { ResponseService } from '../utils/responses/ResponseService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message, ChatRepository])],
  providers: [
    ChatGateway,
    ChatService,
    ChatRepository,
    ResponseService,
    JwtService,
  ],
  controllers: [ChatController],
  exports: [ChatRepository],
})
export class ChatModule {}
