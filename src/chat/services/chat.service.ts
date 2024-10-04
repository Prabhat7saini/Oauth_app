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
  ) { }

  async accessChat(
    currentUserId: string,
    receiverId: string,
  ): Promise<ApiResponse> {
    // console.log("chat service",currentUserId,receiverId)
    try {
      if (!currentUserId || !receiverId) {
        // return this.responseService.error('Ids are needed to access the chat');
      }
      const chat = await this.chatRepository.accessChat(
        currentUserId,
        receiverId,
      );
      // console.log(`Access to chat ${chat.Chat}   and receiver ${`);
      // return this.responseService.success(
      //   'Fetched chat successfully',
      //   200,
      //   chat,
      // );
      return this.responseService.success(`chat fetch successfully`,201,chat);
    } catch (error) {
      console.log(`error while fetching chat #${error.message}`);
      // return this.responseService.error(
      //   'An error occurred while fetching the chat',
      // );
      return this.responseService.error(`An error occurred while fetching the chat`);
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



  async getMessageHistory(
    chatId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<ApiResponse> {
    try {

      if (!chatId) {
        return this.responseService.error('chatId is needed to fetch messages');
      }
      const history = await this.chatRepository.getMessageHistory(
        chatId,
        page,
        limit,
      );
      return this.responseService.success(`message successfully fetch on  ${page}`, 200, history);
    } catch (error) {
      return this.responseService.error(`error fetching message`)
    }
  }

  async createGroupChat(usersId: string[], groupName: string): Promise<ApiResponse> {
    try {
      console.log(usersId.length, "i")

      if (usersId.length < 2) {
        // console.log(typeof usersId.length,"")
        return this.responseService.error(`minimum 3 users are required to create a group chat`)
      }

      if (!groupName) {
        return this.responseService.error('Group name is required.');
      }
      const group = await this.chatRepository.createGroupChat(usersId, groupName)

      return this.responseService.success(`Group created successfully`, 201, group)
    } catch (error) {
      console.log(`Error creating group`)
      this.responseService
        .error(error.message)
    }
  }


  //@description     Fetch all chats for a user
  //@route           GET /api/chat/
  //@access          Protected
  async getChats(userId: string): Promise<ApiResponse> {
    try {
      console.log('Get chats for user', userId);
      const chats = await this.chatRepository.getChats(userId)
      return this.responseService.success(`successfully fetched chats for user`, 201, chats);
    } catch (error) {
      console.log(`Error fetching chats for user ${userId}`, error);
      this.responseService.error(`error fetching chats for user ${userId}`);
    }
  }
}
