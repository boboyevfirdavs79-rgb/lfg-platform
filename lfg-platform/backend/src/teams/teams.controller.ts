import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamsService } from './teams.service';
import { DecideApplicationDto } from './dto/decide-application.dto';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('mine')
  getMyTeams(@Req() req: any) {
    return this.teamsService.getMyTeams(req.user.userId);
  }

  @Patch('applications/:id')
  decide(
    @Param('id') applicationId: string,
    @Body() dto: DecideApplicationDto,
    @Req() req: any,
  ) {
    return this.teamsService.decide(applicationId, req.user.userId, dto.status);
  }
}
