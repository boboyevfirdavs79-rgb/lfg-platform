import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { getErrorMessage } from '../api/getErrorMessage';

type Applicant = {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applicant: { id: string; username: string; steamAvatar?: string };
  createdAt: string;
};

type TeamEntry = {
  post: { id: string; title: string; game: string };
  role: 'owner' | 'member';
  members: Applicant[];
};

type TeamsResponse = { owned: TeamEntry[]; joined: TeamEntry[] };

export default function Team() {
  const [data, setData] = useState<TeamsResponse | null>(null);
  const [pendingByPost, setPendingByPost] = useState<Record<string, Applicant[]>>({});
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get<TeamsResponse>('/teams/mine');
    setData(res.data);

    const pendingEntries = await Promise.all(
      res.data.owned.map(async (entry) => {
        const appsRes = await api.get<Applicant[]>(`/posts/${entry.post.id}/applications`);
        return [entry.post.id, appsRes.data.filter((a) => a.status === 'pending')] as const;
      }),
    );
    setPendingByPost(Object.fromEntries(pendingEntries));
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setError('');
    setBusyId(applicationId);
    try {
      await api.patch(`/teams/applications/${applicationId}`, { status });
      await load();
    } catch (err: any) {
      setError(getErrorMessage(err, "Amalni bajarib bo'lmadi"));
    } finally {
      setBusyId(null);
    }
  };

  if (!data) {
    return <p className="text-muted text-center mt-16">Yuklanmoqda...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-semibold text-ink mb-6">Mening jamoalarim</h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">
          Men boshliq bo'lgan jamoalar
        </h2>
        {data.owned.length === 0 && (
          <p className="text-muted text-sm">
            Hozircha e'loningiz yo'q.{' '}
            <Link to="/create" className="text-accent">
              E'lon bering
            </Link>
          </p>
        )}
        <div className="grid gap-4">
          {data.owned.map((entry) => {
            const pending = pendingByPost[entry.post.id] || [];
            return (
              <div
                key={entry.post.id}
                className="bg-surface border border-line rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-ink">{entry.post.title}</h3>
                  <span className="text-xs bg-accent/15 text-accent px-2 py-1 rounded-full">
                    {entry.post.game}
                  </span>
                </div>

                {entry.members.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted mb-1">A'zolar:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.members.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs bg-surface-2 border border-line text-ink px-2 py-1 rounded-full"
                        >
                          {m.applicant.username}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pending.length > 0 && (
                  <div>
                    <p className="text-xs text-muted mb-1">Kutilayotgan so'rovlar:</p>
                    <div className="flex flex-col gap-2">
                      {pending.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between bg-surface-2 border border-line rounded-lg px-3 py-2"
                        >
                          <span className="text-sm text-ink">{app.applicant.username}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => decide(app.id, 'accepted')}
                              disabled={busyId === app.id}
                              className="text-xs bg-online text-white px-3 py-1 rounded-full disabled:opacity-50"
                            >
                              Qabul
                            </button>
                            <button
                              onClick={() => decide(app.id, 'rejected')}
                              disabled={busyId === app.id}
                              className="text-xs bg-surface border border-line text-muted px-3 py-1 rounded-full disabled:opacity-50"
                            >
                              Rad etish
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">
          A'zo bo'lgan jamoalarim
        </h2>
        {data.joined.length === 0 && (
          <p className="text-muted text-sm">Hozircha hech qayerga qabul qilinmagansiz.</p>
        )}
        <div className="grid gap-4">
          {data.joined.map((entry) => (
            <div key={entry.post.id} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink">{entry.post.title}</h3>
                <span className="text-xs bg-accent/15 text-accent px-2 py-1 rounded-full">
                  {entry.post.game}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.members.map((m) => (
                  <span
                    key={m.id}
                    className="text-xs bg-surface-2 border border-line text-ink px-2 py-1 rounded-full"
                  >
                    {m.applicant.username}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
