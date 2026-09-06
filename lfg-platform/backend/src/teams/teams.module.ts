import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Post } from '../posts/entities/post.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PostApplicationsController } from './post-applications.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Post]), AuthModule, UsersModule],
  providers: [TeamsService],
  controllers: [TeamsController, PostApplicationsController],
})
export class TeamsModule {}
