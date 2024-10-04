import { ApiResponse } from '../../utils/responses/api-response.dto';
import { ChatService } from '../services/chat.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../auth/guard/authenticaton.guard';
import { CustomRequest } from '../../utils/interface/type';
import { MessageDataDto } from '../dto/chatDto';
import { ResponseService } from '../../utils/responses/ResponseService';

@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('/createChat')
  async createChat(
    @Body('receiverId') receiverId: string,
    @Req() req: CustomRequest,
  ): Promise<ApiResponse> {
    try {
      const userId = req.user.id;
      return await this.chatService.accessChat(userId, receiverId);
    } catch (error) {
      return this.responseService.error('Failed to create chat', error);
    }
  }

  @Post('/send_message')
  async sendMessage(@Body() messageData: MessageDataDto): Promise<ApiResponse> {
    try {
      return await this.chatService.sendMessage(
        messageData.text,
        messageData.currentUserId,
        messageData.chatId,
      );
    } catch (error) {
      return this.responseService.error('Failed to send message', error); // Use the response service
    }
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createGroup')
  async createGroupChat(
    @Body('usersId') usersId: string[],
    @Body('groupName') groupName: string,
    @Req() req: CustomRequest,
  ): Promise<ApiResponse> {
    try {
      usersId.push(req.user.id); // Add the current user to the group
      return await this.chatService.createGroupChat(usersId, groupName);
    } catch (error) {
      return this.responseService.error('Failed to create group chat', error);
    }
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getChats')
  async getChats(@Req() req: CustomRequest): Promise<ApiResponse> {
    try {
      return await this.chatService.getChats(req.user.id);
    } catch (error) {
      return this.responseService.error('Failed to retrieve chats', error);
    }
  }
}
