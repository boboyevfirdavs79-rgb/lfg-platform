import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type FaceitStats = {
  nickname: string;
  avatar: string;
  skillLevel: number | null;
  elo: number | null;
  matches: number | null;
  winRatePercent: number | null;
};

@Injectable()
export class FaceitService {
  private readonly logger = new Logger(FaceitService.name);
  private readonly apiKey = process.env.FACEIT_API_KEY || '';

  private get headers() {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  /**
   * Berilgan SteamID64 orqali FACEIT'dagi CS2 profilini va statistikasini topadi.
   * Agar foydalanuvchi FACEIT akkountini Steam bilan bog'lamagan bo'lsa yoki
   * FACEIT_API_KEY sozlanmagan bo'lsa — null qaytaradi (xato emas, shunchaki ma'lumot yo'q).
   */
  async getStatsBySteamId(steamId: string): Promise<FaceitStats | null> {
    if (!this.apiKey) {
      this.logger.warn('FACEIT_API_KEY sozlanmagan — FACEIT statistikasi olinmadi');
      return null;
    }
    try {
      const playerRes = await axios.get('https://open.faceit.com/data/v4/players', {
        headers: this.headers,
        params: { game: 'cs2', game_player_id: steamId },
      });
      const player = playerRes.data;
      const cs2 = player?.games?.cs2;
      const playerId = player?.player_id;
      if (!playerId) return null;

      let matches: number | null = null;
      let winRatePercent: number | null = null;
      try {
        const statsRes = await axios.get(
          `https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`,
          { headers: this.headers },
        );
        const lifetime = statsRes.data?.lifetime;
        matches = lifetime?.Matches ? Number(lifetime.Matches) : null;
        winRatePercent = lifetime?.['Win Rate %'] ? Number(lifetime['Win Rate %']) : null;
      } catch (statsErr) {
        // Ba'zi profillarda lifetime stats bo'lmasligi mumkin — asosiy ma'lumot bilan davom etamiz
        this.logger.warn('FACEIT lifetime stats topilmadi', statsErr as Error);
      }

      return {
        nickname: player.nickname,
        avatar: player.avatar,
        skillLevel: cs2?.skill_level ?? null,
        elo: cs2?.faceit_elo ?? null,
        matches,
        winRatePercent,
      };
    } catch (err: any) {
      if (err?.response?.status === 404) return null; // FACEIT'da topilmadi — normal holat
      this.logger.error('FACEIT API xato', err as Error);
      return null;
    }
  }
}
