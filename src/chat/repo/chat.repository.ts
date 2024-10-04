import { Injectable } from '@nestjs/common';
import { ArrayContains, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity.js';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) { }

  /**
   * Access an existing chat between the current user and the receiver.
   * If the chat does not exist, a new chat will be created.
   *
   * @param currentUserId - ID of the current user
   * @param receiverId - ID of the user to chat with
   * @returns An object containing the chat details.
   */
  async accessChat(
    currentUserId: string,
    receiverId: string,
    // chatId:string,
  ): Promise<{ Chat: Chat }> {
    try {
      // console.log('Accessing chat', currentUserId, receiverId);

      // Check if a chat already exists between the two users
      const chat = await this.chatRepository.findOne({ where: { chatName: `${currentUserId}-${receiverId}` } });

      if (chat) {
        return { Chat: chat }; // Return the existing chat
      } else {
        // Create a new chat if it doesn't exist
        const newChat = this.chatRepository.create({
          chatName: `${currentUserId}-${receiverId}`,
          userIds: [currentUserId, receiverId],
          isGroupChat: false,
        });
        await this.chatRepository.save(newChat);
        console.log('Chat created');
        return { Chat: newChat };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Send a message in a chat.
   *
   * @param text - The content of the message
   * @param chatId - The ID of the chat where the message is sent
   * @param currentUserId - ID of the user sending the message
   * @returns The created message object.
   */
  async sendMessage(
    text: string,
    chatId: string,
    currentUserId: string,
  ): Promise<Message> {
    try {
      // Create a new message instance
      const message = this.messageRepository.create({
        content: text,
        senderId: currentUserId,
        chatId: chatId,
        readBy: [], // Initially, no users have read the message
      });

      // Save the message to the database
      await this.messageRepository.save(message);

      // Update the chat's latest message
      await this.chatRepository.update(chatId, {
        latestMessage: message, // Update the latest message in the chat
      });

      console.log('Chat updated with new message:', message);
      return message; // Return the created message
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Message could not be sent.');
    }
  }

  /**
   * Retrieve the message history for a chat with pagination.
   *
   * @param chatId - The ID of the chat to retrieve messages from
   * @param page - The current page number for pagination (default is 1)
   * @param limit - The number of messages to retrieve per page (default is 50)
   * @returns An object containing an array of messages and the total message count.
   */
  async getMessageHistory(
    chatId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { chatId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    console.log(`Fetched message history for chat ${chatId}, total messages: ${total}`);
    return { messages, total };
  }


  async createGroupChat(usersId: string[], groupName: string): Promise<Chat> {
    try {
      console.log(usersId[usersId.length - 1]);
      const newChat = this.chatRepository.create({
        chatName: groupName,
        userIds: usersId,
        isGroupChat: true,
        groupAdminId: usersId[usersId.length - 1], // Assuming last user is the admin
      });

      await this.chatRepository.save(newChat);
      return newChat;

    } catch (error) {
      console.error('Error creating group chat:', error.message);
      throw new Error(`Could not create group chat: ${error.message}`);
    }
  }


  async getChats(userId: string): Promise<Chat[]> {
    try {
      console.log('Get chats for user', userId);

      const chats = await this.chatRepository.find({
        where: {
          userIds: ArrayContains([userId]), // Use ArrayContains to check if userId is in the userIds array
        },
        relations: ['messages', 'latestMessage'], // Load related messages and latest message
      });

      return chats;
    } catch (error) {
      console.log(`Error fetching chats for user ${userId}`, error);
      return [];
    }
  }

}
