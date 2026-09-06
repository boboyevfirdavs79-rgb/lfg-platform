import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../posts/entities/post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true, unique: true })
  steamId: string;

  @Column({ nullable: true })
  steamPersonaName: string;

  @Column({ nullable: true })
  steamAvatar: string;

  @Column({ nullable: true })
  telegramUsername: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;
}
