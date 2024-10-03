import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity'; // Correct typo from "entitis" to "entities"
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity.js'; // Same as above

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  //   async accessChat(
  //     currentUserId: string,
  //     receiverId: string,
  //   ): Promise<{ Chat: Chat; message: Message[] }> {
  //     // const isChat = await this.chatRepository.findOne({
  //     //     where: { userIds: In([currentUserId, receiverId]) },

  //     //     relations: ['messages'],
  //     // });
  //     // const isChat = await this.chatRepository.createQueryBuilder("chat")
  //     //     .where("chat.userIds && :userIds", { userIds: [currentUserId, receiverId] })
  //     //     .leftJoinAndSelect("chat.messages", "message")
  //     //     .getOne();

  //     //     const isChat = await this.chatRepository.query(
  //     //         `SELECT chat.*, message.*
  //     //  FROM chat
  //     //  LEFT JOIN messages AS message ON message."chatId" = chat."chatId"
  //     //  WHERE chat."userIds" @> ARRAY[$1::uuid, $2::uuid];`,
  //     //         [currentUserId, receiverId]
  //     //     );
  //     const isChat = await this.chatRepository.query(
  //       `
  //   SELECT
  //     chat.*,
  //     COALESCE(
  //       json_agg(message) FILTER (WHERE message IS NOT NULL),
  //       '[]'
  //     ) AS messages
  //   FROM
  //     chat
  //   LEFT JOIN
  //     messages AS message ON message."chatId" = chat."chatId"
  //   WHERE
  //     chat."userIds" @> ARRAY[$1::uuid, $2::uuid]
  //   GROUP BY
  //     chat."chatId";
  //   `,
  //       [currentUserId, receiverId],
  //     );

  //     // console.log('Chat:', isChat);
  //     if (isChat.length > 0) {
  //       // console.log("Chat found:", isChat);

  //     //   const messages = await this.chatRepository.query(
  //     //     `SELECT chat.*, message.*
  //     //  FROM chat
  //     //  LEFT JOIN messages AS message ON message."chatId" = chat."chatId"
  //     //  WHERE chat."userIds" @> ARRAY[$1::uuid, $2::uuid];`,
  //     //     [currentUserId, receiverId],
  //     //   );
  // const
  //       return { Chat: isChat, message: [] };
  //     } else {
  //       const chat = this.chatRepository.create({
  //         chatName: `${currentUserId}-${receiverId}`,
  //         userIds: [currentUserId, receiverId],
  //         isGroupChat: false,
  //       });
  //       await this.chatRepository.save(chat);
  //     }
  //     // console.log(isChat.messages, "check mesa")
  //     return { Chat: isChat, message: isChat.messages || [] };
  //   }

  async accessChat(
    currentUserId: string,
    receiverId: string,
  ): Promise<{ Chat: Chat; message: Message[] }> {
    try {
      console.log('Accessing chat', currentUserId, receiverId);
      const chat = await this.chatRepository
        .createQueryBuilder('chat')
        .where(':currentUserId = ANY(chat.userIds)', { currentUserId })
        .andWhere(':receiverId = ANY(chat.userIds)', { receiverId })
        .getOne();
      // console.log(chat.latestMessage, "chat");

      if (chat) {
        // const messages = await this.chatRepository.query(
        //   `SELECT chat.*, message.*
        //      FROM chat
        //      LEFT JOIN messages AS message ON message."chatId" = chat."chatId"
        //      WHERE chat."userIds" @> ARRAY[$1::uuid, $2::uuid];`,
        //   [currentUserId, receiverId],
        // );
        // console.log(messages,"message")

        const messages = await this.chatRepository.query(
          `SELECT message.*
       FROM messages AS message
       WHERE message."chatId" = $1;`,
          [chat.chatId],
        );
        // const sortedMessages = messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Fetch the latest message if it exists
        // const latestMessage = sortedMessages[0];
        // console.log(sortedMessages, latestMessage,"console")
        return { Chat: chat, message: messages };
      } else {
        const chat = this.chatRepository.create({
          chatName: `${currentUserId}-${receiverId}`,
          userIds: [currentUserId, receiverId],
          isGroupChat: false,
        });
        await this.chatRepository.save(chat);
        console.log('Chat created');
        return { Chat: chat, message: [] };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
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

      // Optionally, update the chat's latest message if necessary
      await this.chatRepository.update(chatId, {
        latestMessage: message, // Update the latest message in the chat
      });

      console.log('Chat updated');
      console.log(message);

      return message; // Return the created message
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Message could not be sent.');
    }
  }
}
