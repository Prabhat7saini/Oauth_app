import { Logger, UseGuards } from '@nestjs/common';
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
import { WsAuthenticationGuard } from 'src/auth/guard/wsauthentication.guard';
import { SocketAuthMiddleware } from './ws.middleware';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthenticationGuard) // Protect the WebSocket gateway with authentication
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private limit = 50;
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private chatService: ChatService) {}

  // Tracks user connection statuses
  private userStatus: { [userId: string]: boolean } = {};

  afterInit(client: Socket) {
    this.logger.log('Initialized WebSocket Gateway');
    client.use(SocketAuthMiddleware() as any);
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.user.id; // Get user ID from handshake
    this.userStatus[userId] = true; // Set user as online
    this.logger.log(`New user connected: ${userId}`);
    client.broadcast.emit('userStatusUpdate', { userId, status: 'online' }); // Notify others
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.user.id; // Get user ID from handshake
    this.userStatus[userId] = false; // Set user as offline
    this.logger.log(`User ${userId} disconnected`);
    client.broadcast.emit('userStatusUpdate', { userId, status: 'offline' });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody('chatId') chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.auth.user.id; // Extract the user ID from the request

    client.join(chatId); // Add the client to the chat room
    this.logger.log(`User ${userId} joined room ${chatId}`);

    client.emit('joinedRoom', {
      chatId,
      message: `You have joined room ${chatId}`,
    });

    client.to(chatId).emit('userJoined', {
      userId,
      message: `User ${userId} has joined the chat.`,
    });

    // Send existing messages to the user
    const messageHistory = await this.chatService.getMessageHistory(
      chatId,
      1,
      this.limit,
    ); // Fetch messages
    client.emit('existingMessages', messageHistory);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { chatId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, message } = data;
    const senderId = client.handshake.auth.user.id;
    console.log(senderId, '   ', chatId, '   ', message);
    const sentMessage = await this.chatService.sendMessage(
      message,
      senderId,
      chatId,
    );
    this.logger.log(`Message from ${senderId} to room ${chatId}: ${message}`);

    // Emit the new message to the specific room
    this.server.to(chatId).emit('receiveMessage', { sentMessage, senderId });
  }

  @SubscribeMessage('loadMoreMessages')
  async handleLoadMoreMessages(
    @MessageBody() data: { chatId: string; page: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, page } = data;
    const messages = await this.chatService.getMessageHistory(
      chatId,
      page,
      this.limit,
    );
    client.emit('moreMessages', { messages });
  }
}
