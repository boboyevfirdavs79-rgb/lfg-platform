import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { SteamService } from '../integrations/steam.service';
import { UsersService } from '../users/users.service';

/**
 * Bu login emas — mavjud (allaqachon tizimga kirgan) foydalanuvchining
 * akkountiga Steam'ni ULASH oqimi. Brauzer to'liq sahifa ko'chishi (redirect)
 * qiladi, shuning uchun JWT'ni Authorization header emas, `token` query
 * parametri orqali uzatamiz — u Steam orqali return URL'ga qaytib keladi.
 */
@Controller('auth/steam')
export class SteamAuthController {
  private readonly frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  private readonly returnUrl =
    process.env.STEAM_RETURN_URL || 'http://localhost:3000/auth/steam/return';

  constructor(
    private readonly steamService: SteamService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @Get('link')
  async link(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new BadRequestException('token parametri kerak');
    // Token haqiqiyligini oldindan tekshiramiz — noto'g'ri token bilan
    // odamni Steam'ga yubormaymiz.
    this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET || 'super-secret-change-me',
    });

    const returnUrlWithToken = `${this.returnUrl}?token=${encodeURIComponent(token)}`;
    const steamAuthUrl = await this.steamService.authenticate(returnUrlWithToken);
    res.redirect(steamAuthUrl);
  }

  @Get('return')
  async return(@Req() req: Request, @Res() res: Response) {
    const token = req.query.token as string;
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-change-me',
      });
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const steamId = await this.steamService.verifyAssertion(fullUrl);

      if (!steamId) {
        return res.redirect(`${this.frontendUrl}/profile?steamError=verification_failed`);
      }

      const summary = await this.steamService.getPlayerSummary(steamId);
      await this.usersService.update(payload.sub, {
        steamId,
        steamPersonaName: summary?.personaName,
        steamAvatar: summary?.avatarFull,
      });

      return res.redirect(`${this.frontendUrl}/profile?steamLinked=1`);
    } catch (err: any) {
      const isDuplicate = err?.code === '23505'; // Postgres unique constraint
      const reason = isDuplicate ? 'already_linked' : 'unknown';
      return res.redirect(`${this.frontendUrl}/profile?steamError=${reason}`);
    }
  }
}
