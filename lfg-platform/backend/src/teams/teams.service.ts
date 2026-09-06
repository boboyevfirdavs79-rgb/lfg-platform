import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepo: Repository<Application>,
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
  ) {}

  async apply(postId: string, applicantId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException("E'lon topilmadi");
    if (post.author.id === applicantId) {
      throw new BadRequestException("O'z e'loningizga so'rov yubora olmaysiz");
    }

    const existing = await this.applicationsRepo.findOne({
      where: { post: { id: postId }, applicant: { id: applicantId } },
    });
    if (existing) {
      throw new BadRequestException('Siz bu e\'longa allaqachon so\'rov yuborgansiz');
    }

    const application = this.applicationsRepo.create({
      post: { id: postId } as any,
      applicant: { id: applicantId } as any,
      status: 'pending',
    });
    return this.applicationsRepo.save(application);
  }

  async listForPost(postId: string, requesterId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException("E'lon topilmadi");
    if (post.author.id !== requesterId) {
      throw new ForbiddenException("Faqat e'lon egasi so'rovlarni ko'ra oladi");
    }
    return this.applicationsRepo.find({
      where: { post: { id: postId } },
      order: { createdAt: 'DESC' },
    });
  }

  async decide(applicationId: string, ownerId: string, status: ApplicationStatus) {
    const application = await this.applicationsRepo.findOne({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException("So'rov topilmadi");
    if (application.post.author.id !== ownerId) {
      throw new ForbiddenException('Bu so\'rov ustidan sizda huquq yo\'q');
    }
    application.status = status;
    return this.applicationsRepo.save(application);
  }

  /** Foydalanuvchining boshqargan va a'zo bo'lgan jamoalari. */
  async getMyTeams(userId: string) {
    const ownedPosts = await this.postsRepo.find({
      where: { author: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    const ownedTeams = await Promise.all(
      ownedPosts.map(async (post) => ({
        post,
        role: 'owner' as const,
        members: await this.applicationsRepo.find({
          where: { post: { id: post.id }, status: 'accepted' },
        }),
      })),
    );

    const joinedApplications = await this.applicationsRepo.find({
      where: { applicant: { id: userId }, status: 'accepted' },
      order: { createdAt: 'DESC' },
    });
    const joinedTeams = await Promise.all(
      joinedApplications.map(async (app) => ({
        post: app.post,
        role: 'member' as const,
        members: await this.applicationsRepo.find({
          where: { post: { id: app.post.id }, status: 'accepted' },
        }),
      })),
    );

    return { owned: ownedTeams, joined: joinedTeams };
  }
}
