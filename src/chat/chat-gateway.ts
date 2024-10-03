import { Logger, Req } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './services/chat.service';
import { CustomRequest } from '../utils/interface/type';
import { UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../auth/guard/authenticaton.guard';
import { WsAuthenticationGuard } from 'src/auth/guard/wsauthentication.guard';
import { SocketAuthMiddleware } from './ws.middleware';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust based on your production needs
  },
})
// @UseGuards(WsAuthenticationGuard)
// Protect the WebSocket gateway with AuthGuard
@UseGuards(WsAuthenticationGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private chatService: ChatService) {}
  private userStatus: { [userId: string]: boolean } = {};

  afterInit(client: Socket) {
    this.logger.log('Initialized WebSocket Gateway');
    client.use(SocketAuthMiddleware() as any);
    // console.log(token,"oihv")
    // console.log("check")
  }

  handleConnection(client: Socket) {
    this.logger.log(`New user connected: ${client.id}`);
    const userId = client.handshake.auth.user.id; // Get user ID from handshake
    this.userStatus[userId] = true;
    client.broadcast.emit('userStatusUpdate', { userId, status: 'online' });
    // console.log(client.handshake.auth.user);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.user.id; // Get user ID from handshake
    this.userStatus[userId] = false; // Set user as offline
    this.logger.log(`User ${userId} disconnected: ${client.id}`);

    // Notify others in the chat room about the user's offline status
    client.broadcast.emit('userStatusUpdate', { userId, status: 'offline' });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('receiverId') receiverId: string, // Get receiverId from message body
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.auth.user.id; // Extract the user ID from the request
    // const { receiverId } = data; // Get receiverId from the payload
    this.logger.log(`User ID: ${userId}, Receiver ID: ${receiverId}`);

    const chat = await this.chatService.accessChat(userId, receiverId);

    if (!chat) {
      client.emit('error', { message: 'Chat not found' });
      return;
    }
    const chatId = chat.Chat.chatId; // Use singular
    console.log(chatId, 'chat id ');
    client.join(chatId); // Add the client to the specified room

    this.logger.log(`User ${userId} joined room ${chatId}`);
    client.emit('joinedRoom', {
      chatId,
      message: `You have joined room ${chatId}`,
    });
    client.to(chatId).emit('userJoined', {
      userId,
      message: `User ${userId} has joined the chat.`,
    });
    client.to(chatId).emit('userStatusUpdate', {
      userId,
      status: this.userStatus[userId] ? 'online' : 'offline',
    });
    // Send existing messages to the user
    console.log('Send existing messages', chat.message);
    client.emit('existingMessages', chat.message);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { roomId: string; message: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('send message: ' + data.message);
    const { roomId, message, senderId } = data;
    const mess = await this.chatService.sendMessage(message, senderId, roomId);
    this.logger.log(`Message from ${senderId} to room ${roomId}: ${message}`);
    console.log('message sent');
    // Emit the message to the specific room
    this.server.to(roomId).emit('receiveMessage', { mess, senderId });
  }
}
