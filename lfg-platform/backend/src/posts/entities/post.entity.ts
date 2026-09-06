import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  game: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  rankLevel: string;

  @Column({ default: 1 })
  playersNeeded: number;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  author: User;

  @CreateDateColumn()
  createdAt: Date;
}
