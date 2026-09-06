import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
// `openid` kutubxonasi uchun rasmiy TypeScript tipi soddalashtirilgan,
// shuning uchun `require` orqali olib, minimal interfeys bilan ishlatamiz.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const openid = require('openid');

export type SteamSummary = {
  steamId: string;
  personaName: string;
  avatarFull: string;
  profileUrl: string;
};

@Injectable()
export class SteamService {
  private readonly logger = new Logger(SteamService.name);
  private readonly apiKey = process.env.STEAM_API_KEY || '';
  private readonly returnUrl =
    process.env.STEAM_RETURN_URL || 'http://localhost:3000/auth/steam/return';
  private readonly realm = process.env.STEAM_REALM || 'http://localhost:3000/';

  private getRelyingParty(returnUrlOverride?: string) {
    return new openid.RelyingParty(
      returnUrlOverride || this.returnUrl,
      this.realm,
      true, // stateless — sessiya kerak emas, bizning API JWT asosida ishlaydi
      false,
      [],
    );
  }

  /** Steam login sahifasiga yo'naltiriladigan URL yaratadi. */
  authenticate(returnUrlOverride?: string): Promise<string> {
    const rp = this.getRelyingParty(returnUrlOverride);
    return new Promise((resolve, reject) => {
      rp.authenticate('https://steamcommunity.com/openid', false, (err: any, authUrl: string) => {
        if (err || !authUrl) {
          return reject(err || new Error('Steam autentifikatsiya URL yaratilmadi'));
        }
        resolve(authUrl);
      });
    });
  }

  /** Steam'dan qaytgan so'rovni tekshiradi va SteamID64'ni chiqarib beradi. */
  verifyAssertion(fullReturnUrl: string): Promise<string | null> {
    const rp = this.getRelyingParty();
    return new Promise((resolve, reject) => {
      rp.verifyAssertion(fullReturnUrl, (err: any, result: any) => {
        if (err) return reject(err);
        if (!result || !result.authenticated || !result.claimedIdentifier) {
          return resolve(null);
        }
        // claimedIdentifier: https://steamcommunity.com/openid/id/76561198XXXXXXXXX
        const match = /\/id\/(\d+)$/.exec(result.claimedIdentifier);
        resolve(match ? match[1] : null);
      });
    });
  }

  async getPlayerSummary(steamId: string): Promise<SteamSummary | null> {
    if (!this.apiKey) {
      this.logger.warn('STEAM_API_KEY sozlanmagan — profil ma\'lumotlari olinmadi');
      return null;
    }
    try {
      const { data } = await axios.get(
        'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
        { params: { key: this.apiKey, steamids: steamId } },
      );
      const player = data?.response?.players?.[0];
      if (!player) return null;
      return {
        steamId: player.steamid,
        personaName: player.personaname,
        avatarFull: player.avatarfull,
        profileUrl: player.profileurl,
      };
    } catch (err) {
      this.logger.error('Steam GetPlayerSummaries xato', err as Error);
      return null;
    }
  }

  /** CS2 (appid 730) uchun umumiy o'yin soatini qaytaradi. Profil yopiq bo'lsa null. */
  async getCS2PlaytimeMinutes(steamId: string): Promise<number | null> {
    if (!this.apiKey) return null;
    try {
      const { data } = await axios.get(
        'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
        {
          params: {
            key: this.apiKey,
            steamid: steamId,
            include_appinfo: false,
            appids_filter: [730],
          },
        },
      );
      const game = data?.response?.games?.find((g: any) => g.appid === 730);
      return game ? game.playtime_forever : 0;
    } catch (err) {
      this.logger.error('Steam GetOwnedGames xato', err as Error);
      return null;
    }
  }
}
