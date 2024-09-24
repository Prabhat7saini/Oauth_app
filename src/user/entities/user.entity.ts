import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  Unique,
  DeleteDateColumn,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  address: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  reSetPasswordExpires: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'user_roles' }) // This will create the user_roles join table automatically
  roles: Role[];
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
