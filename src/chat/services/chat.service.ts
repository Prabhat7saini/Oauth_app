import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../repo/chat.repository';
import { ApiResponse } from 'src/utils/responses/api-response.dto';
import { privateDecrypt } from 'crypto';
import { ResponseService } from '../../utils/responses/ResponseService';
import { Message } from '../entities/message.entity';
import { Chat } from '../entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly responseService: ResponseService,
  ) {}

  async accessChat(
    currentUserId: string,
    receiverId: string,
  ): Promise<{ Chat: Chat; message: Message[] }> {
    // console.log("chat service",currentUserId,receiverId)
    try {
      if (!currentUserId || !receiverId) {
        // return this.responseService.error('Ids are needed to access the chat');
      }
      const chat = await this.chatRepository.accessChat(
        currentUserId,
        receiverId,
      );
      console.log(`Access to chat ${chat.Chat}   and receiver ${chat.message}`);
      // return this.responseService.success(
      //   'Fetched chat successfully',
      //   200,
      //   chat,
      // );
      return chat;
    } catch (error) {
      console.log(`error while fetching chat #${error.message}`);
      // return this.responseService.error(
      //   'An error occurred while fetching the chat',
      // );
      return;
    }
  }

  async sendMessage(
    text: string,
    currentUserId: string,
    chatId: string,
  ): Promise<ApiResponse> {
    if (!text || !currentUserId || !chatId) {
      return this.responseService.error(
        'Text, currentUserId and chatId are needed to send a message',
      );
    }
    try {
      const message = await this.chatRepository.sendMessage(
        text,
        chatId,
        currentUserId,
      );
      console.log(message, 'Sent');
      return this.responseService.success(
        'Message sent successfully',
        200,
        message,
      );
    } catch (error) {
      console.log(`error while sending message #${error.message}`);
      return this.responseService.error(
        'An error occurred while sending the message',
      );
    }
  }
}
