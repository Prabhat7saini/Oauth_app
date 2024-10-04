import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiResponse } from 'src/utils/responses/api-response.dto';
import { ChatService } from '../services/chat.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from 'src/auth/guard/authenticaton.guard';
import { Request } from 'express';
import { CustomRequest } from '../../utils/interface/type';
import { User } from 'src/user/entities/user.entity';
import { useLayoutEffect } from 'react';

class PayloadDataDto {
  currentUserId: string;
  receiverId: string;
}

class payloadDataDto {
  text: string;
  currentUserId: string;
  chatId: string;
}

@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @MessagePattern({ cmd: 'get_chats' })

  // @Post('/getchats')
  // async getChats(@Body() PayloadData: PayloadDataDto): Promise<ApiResponse> {
  //   console.log('enter the access chat api', PayloadData);
  //   return this.chatService.accessChat(
  //     PayloadData.currentUserId,
  //     PayloadData.receiverId,
  //   );
  // }

  // @MessagePattern({ cmd: 'send_message' })
  @UseGuards(AuthenticationGuard)
  @Post('/createChat')
  async createChat(
    @Body('receiverId') receiverId: string,
    @Req() req: CustomRequest,
  ): Promise<ApiResponse> {
    return this.chatService.accessChat(req.user.id, receiverId);
  }

  @Post('/send_message')
  async sendMessage(@Body() payloadData: payloadDataDto): Promise<ApiResponse> {
    console.log(payloadData);
    return await this.chatService.sendMessage(
      payloadData.text,
      payloadData.currentUserId,
      payloadData.chatId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Post(`/createGroup`)
  async createGroupChat(
    @Body('usersId') usersId: string[],
    @Body('groupName') groupName: string,
    @Req() req: CustomRequest,
  ): Promise<ApiResponse> {
    usersId.push(req.user.id);
    return await this.chatService.createGroupChat(usersId, groupName);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getChats')
  async getChats(@Req() req: CustomRequest): Promise<ApiResponse> {
    return await this.chatService.getChats(req.user.id);
  }
}
