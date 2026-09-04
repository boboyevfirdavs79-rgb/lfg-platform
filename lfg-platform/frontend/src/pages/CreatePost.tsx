import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getErrorMessage } from '../api/getErrorMessage';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [game, setGame] = useState('');
  const [region, setRegion] = useState('');
  const [rankLevel, setRankLevel] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [error, setError] = useState('');
  const [hasSteam, setHasSteam] = useState<boolean | null>(null); // null = hali tekshirilmoqda
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/me').then((res) => setHasSteam(!!res.data.steamId));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/posts', {
        title,
        description,
        game,
        region,
        rankLevel,
        playersNeeded: Number(playersNeeded),
      });
      navigate('/');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Xatolik yuz berdi'));
    }
  };

  const inputClass =
    'bg-surface-2 border border-line rounded-lg px-4 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent';

  if (hasSteam === false) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-surface border border-line rounded-xl text-center">
        <h1 className="text-xl font-semibold text-ink mb-2">
          Avval Steam akkountingizni ulang
        </h1>
        <p className="text-muted text-sm mb-6">
          E'lon berish uchun Steam profilingiz ulangan bo'lishi kerak — bu
          orqali boshqa o'yinchilar sizning real statistikangizni ko'ra oladi
          va ishonch darajasi oshadi.
        </p>
        <Link
          to="/profile"
          className="inline-block bg-accent text-white rounded-lg px-5 py-2 font-medium hover:bg-accent-hover transition"
        >
          Profilga o'tish
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-surface border border-line rounded-xl">
      <h1 className="text-2xl font-semibold mb-6 text-ink">
        Yangi e'lon berish
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Sarlavha"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
        <textarea
          placeholder="Tavsif"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="O'yin nomi (masalan: CS2)"
          value={game}
          onChange={(e) => setGame(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Daraja (masalan: Immortal)"
          value={rankLevel}
          onChange={(e) => setRankLevel(e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          min={1}
          placeholder="Necha kishi kerak"
          value={playersNeeded}
          onChange={(e) => setPlayersNeeded(Number(e.target.value))}
          className={inputClass}
        />
        {error && (
          <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
        )}
        <button
          type="submit"
          disabled={hasSteam === null}
          className="bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent-hover transition disabled:opacity-50"
        >
          E'lonni joylash
        </button>
      </form>
    </div>
  );
}
