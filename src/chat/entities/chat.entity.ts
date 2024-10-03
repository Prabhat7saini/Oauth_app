import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  chatId: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  chatName: string;

  @Column({ default: false })
  isGroupChat: boolean;

  @Column('uuid', { array: true })
  userIds: string[];

  @OneToMany(() => Message, (message) => message.chat, { eager: true }) // Add eager loading
  messages: Message[];

  @ManyToOne(() => Message, (message) => message.chat, { nullable: true })
  latestMessage: Message;

  @Column('uuid', { nullable: true })
  groupAdminId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
