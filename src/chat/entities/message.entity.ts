import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from './chat.entity.js'; // Adjust the path as necessary
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  senderId: string; // Store sender's user ID

  @Column({ type: 'text' })
  content: string;

  @Column('uuid')
  chatId: string; // Store chat ID

  @Column('uuid', { array: true, nullable: true }) // Store read by user IDs
  readBy: string[]; // Array of user IDs who have read the message

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
