import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
  ) {}

  async create(dto: CreatePostDto, authorId: string) {
    const post = this.postsRepo.create({
      ...dto,
      author: { id: authorId } as any,
    });
    return this.postsRepo.save(post);
  }

  findAll(filters: { game?: string; region?: string }) {
    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC');

    if (filters.game) {
      qb.andWhere('post.game ILIKE :game', { game: `%${filters.game}%` });
    }
    if (filters.region) {
      qb.andWhere('post.region ILIKE :region', { region: `%${filters.region}%` });
    }
    return qb.getMany();
  }

  async findOne(id: string) {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('E\'lon topilmadi');
    return post;
  }

  async remove(id: string, userId: string) {
    const post = await this.findOne(id);
    if (post.author.id !== userId) {
      throw new ForbiddenException('Bu e\'lonni o\'chirish huquqingiz yo\'q');
    }
    await this.postsRepo.remove(post);
    return { success: true };
  }
}
