import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

@Entity('applications')
// Bir foydalanuvchi bitta postga faqat bitta so'rov yubora oladi
@Unique(['post', 'applicant'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { eager: true, onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  applicant: User;

  @Column({ type: 'varchar', default: 'pending' })
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;
}
