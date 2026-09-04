import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { getErrorMessage } from '../api/getErrorMessage';

type FaceitStats = {
  nickname: string;
  avatar: string;
  skillLevel: number | null;
  elo: number | null;
  matches: number | null;
  winRatePercent: number | null;
};

type Profile = {
  id: string;
  username: string;
  email: string;
  region?: string;
  steamId?: string;
  steamPersonaName?: string;
  steamAvatar?: string;
  telegramUsername?: string;
  phoneNumber?: string;
  cs2PlaytimeMinutes: number | null;
  faceit: FaceitStats | null;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [region, setRegion] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const load = async () => {
    const res = await api.get<Profile>('/users/me');
    setProfile(res.data);
    setRegion(res.data.region || '');
    setTelegramUsername(res.data.telegramUsername || '');
    setPhoneNumber(res.data.phoneNumber || '');
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get('steamLinked')) {
      setSaveMessage('Steam akkountingiz muvaffaqiyatli ulandi!');
    }
    const steamError = searchParams.get('steamError');
    if (steamError === 'already_linked') {
      setError('Bu Steam akkounti allaqachon boshqa foydalanuvchiga ulangan');
    } else if (steamError) {
      setError('Steam ulashda xatolik yuz berdi, qayta urinib ko\'ring');
    }
  }, [searchParams]);

  const handleLinkSteam = () => {
    const token = localStorage.getItem('token');
    window.location.href = `${API_URL}/auth/steam/link?token=${encodeURIComponent(token || '')}`;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaveMessage('');
    setSaving(true);
    try {
      await api.patch('/users/me', { region, telegramUsername, phoneNumber });
      setSaveMessage('Saqlandi');
      await load();
    } catch (err: any) {
      setError(getErrorMessage(err, "Saqlab bo'lmadi"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'bg-surface-2 border border-line rounded-lg px-4 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent';

  if (!profile) {
    return <p className="text-muted text-center mt-16">Yuklanmoqda...</p>;
  }

  const playtimeHours = profile.cs2PlaytimeMinutes
    ? Math.round(profile.cs2PlaytimeMinutes / 60)
    : 0;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 grid gap-6 sm:grid-cols-[280px_1fr]">
      {/* Chap ustun — Steam/FACEIT karta */}
      <div className="bg-surface border border-line rounded-xl p-5 flex flex-col items-center text-center gap-3 h-fit">
        {profile.steamAvatar ? (
          <img
            src={profile.steamAvatar}
            alt={profile.steamPersonaName}
            className="w-24 h-24 rounded-xl border border-line"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-3xl text-muted">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-ink">
            {profile.steamPersonaName || profile.username}
          </p>
          <p className="text-xs text-muted">{profile.region || 'Region kiritilmagan'}</p>
        </div>

        {!profile.steamId ? (
          <button
            onClick={handleLinkSteam}
            className="w-full bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-accent-hover transition"
          >
            Steam ulash
          </button>
        ) : (
          <div className="w-full flex flex-col gap-2 text-left">
            <div className="bg-surface-2 border border-line rounded-lg p-3">
              <p className="text-xs text-muted uppercase tracking-wide">CS2 playtime</p>
              <p className="text-ink font-semibold">
                {profile.cs2PlaytimeMinutes === null
                  ? "Profil yopiq — ko'rinmaydi"
                  : `${playtimeHours} soat`}
              </p>
            </div>
            <div className="bg-surface-2 border border-line rounded-lg p-3">
              <p className="text-xs text-muted uppercase tracking-wide">FACEIT</p>
              {profile.faceit ? (
                <>
                  <p className="text-ink font-semibold">
                    Level {profile.faceit.skillLevel ?? '—'} · {profile.faceit.elo ?? '—'} ELO
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {profile.faceit.matches ?? '—'} o'yin ·{' '}
                    {profile.faceit.winRatePercent ?? '—'}% win rate
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted">
                  FACEIT akkounti topilmadi. Steam bilan bog'langan FACEIT
                  akkountingiz bo'lsa, shu yerda avtomatik ko'rinadi.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* O'ng ustun — sozlamalar */}
      <div className="bg-surface border border-line rounded-xl p-6">
        <h1 className="text-xl font-semibold text-ink mb-1">Profilni tahrirlash</h1>
        <p className="text-sm text-muted mb-6">
          Bu ma'lumotlarni boshqa o'yinchilar sizning e'loningizda ko'radi.
        </p>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wide mb-1 block">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Masalan: Tashkent"
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wide mb-1 block">
              Telegram username
            </label>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="@username"
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wide mb-1 block">
              Telefon raqam
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+998 90 123 45 67"
              className={`${inputClass} w-full`}
            />
          </div>
          {error && <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>}
          {saveMessage && <p className="text-online text-sm">{saveMessage}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent-hover transition disabled:opacity-50 w-fit px-6"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </div>
    </div>
  );
}
