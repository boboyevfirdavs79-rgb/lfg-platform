import { Module } from '@nestjs/common';
import { SteamService } from './steam.service';
import { FaceitService } from './faceit.service';

@Module({
  providers: [SteamService, FaceitService],
  exports: [SteamService, FaceitService],
})
export class IntegrationsModule {}
