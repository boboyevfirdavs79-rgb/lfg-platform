import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireSteamGuard } from '../auth/require-steam.guard';
import { TeamsService } from './teams.service';

@Controller('posts')
export class PostApplicationsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(JwtAuthGuard, RequireSteamGuard)
  @Post(':id/apply')
  apply(@Param('id') postId: string, @Req() req: any) {
    return this.teamsService.apply(postId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applications')
  list(@Param('id') postId: string, @Req() req: any) {
    return this.teamsService.listForPost(postId, req.user.userId);
  }
}
