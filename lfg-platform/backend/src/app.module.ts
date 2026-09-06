import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { TeamsModule } from './teams/teams.module';
import { MessagesModule } from './messages/messages.module';
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { Application } from './teams/entities/application.entity';
import { Message } from './messages/entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'lfg_platform',
      entities: [User, Post, Application, Message],
      synchronize: true, // MVP uchun; productionda migration ishlatiladi
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    TeamsModule,
    MessagesModule,
  ],
})
export class AppModule {}
