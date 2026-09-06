import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SteamService } from '../integrations/steam.service';
import { FaceitService } from '../integrations/faceit.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly steamService: SteamService,
    private readonly faceitService: FaceitService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new NotFoundException();
    return this.withGameStats(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Body() dto: UpdateProfileDto, @Req() req: any) {
    const user = await this.usersService.update(req.user.userId, dto);
    return this.withGameStats(user!);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return this.withGameStats(user);
  }

  /** Steam ulangan bo'lsa — CS2 playtime va FACEIT statistikasini jonli qo'shib beradi.
   *  MUHIM: `user`ni spread (...) qilib yangi plain objectga aylantirmaymiz — aks holda
   *  `User` klassidagi `@Exclude()` (parolni yashirish) metadatasi yo'qolib, parol
   *  javobda oshkor bo'lib qolardi. Shuning uchun mavjud instansiyaga qo'shimcha
   *  maydonlarni to'g'ridan-to'g'ri biriktiramiz.
   */
  private async withGameStats(user: any) {
    if (!user.steamId) {
      user.cs2PlaytimeMinutes = null;
      user.faceit = null;
      return user;
    }
    const [cs2PlaytimeMinutes, faceit] = await Promise.all([
      this.steamService.getCS2PlaytimeMinutes(user.steamId),
      this.faceitService.getStatsBySteamId(user.steamId),
    ]);
    user.cs2PlaytimeMinutes = cs2PlaytimeMinutes;
    user.faceit = faceit;
    return user;
  }
}
