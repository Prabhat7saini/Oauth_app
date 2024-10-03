import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiResponse } from 'src/utils/responses/api-response.dto';
import { ChatService } from '../services/chat.service';
import { Body, Controller, Post } from '@nestjs/common';

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
  @Post('/send_message')
  async sendMessage(@Body() payloadData: payloadDataDto): Promise<ApiResponse> {
    console.log(payloadData);
    return await this.chatService.sendMessage(
      payloadData.text,
      payloadData.currentUserId,
      payloadData.chatId,
    );
  }
}
