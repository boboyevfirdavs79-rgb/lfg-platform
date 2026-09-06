import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post as HttpPost,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireSteamGuard } from '../auth/require-steam.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query('game') game?: string, @Query('region') region?: string) {
    return this.postsService.findAll({ game, region });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RequireSteamGuard)
  @HttpPost()
  create(@Body() dto: CreatePostDto, @Req() req: any) {
    return this.postsService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.postsService.remove(id, req.user.userId);
  }
}
