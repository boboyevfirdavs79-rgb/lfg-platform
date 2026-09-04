import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/getErrorMessage';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [gameFilter, setGameFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyError, setApplyError] = useState('');
  const { user } = useAuth();

  const loadPosts = async (game?: string, region?: string) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (game) params.game = game;
    if (region) params.region = region;
    const res = await api.get('/posts', { params });
    setPosts(res.data);
    setLoading(false);
  };

  const handleSearch = () => {
    loadPosts(gameFilter, regionFilter);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu e'lonni o'chirmoqchimisiz?")) return;
    setDeleteError('');
    setDeletingId(id);
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setDeleteError(getErrorMessage(err, "E'lonni o'chirib bo'lmadi"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleApply = async (id: string) => {
    setApplyError('');
    setApplyingId(id);
    try {
      await api.post(`/posts/${id}/apply`);
      setAppliedIds((prev) => new Set(prev).add(id));
    } catch (err: any) {
      setApplyError(getErrorMessage(err, "So'rov yuborib bo'lmadi"));
    } finally {
      setApplyingId(null);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          Teammate izlash e'lonlari
        </h1>
        {user && (
          <Link
            to="/create"
            className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition"
          >
            + E'lon berish
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="O'yin nomi bo'yicha filtr (masalan: Valorant)"
          value={gameFilter}
          onChange={(e) => setGameFilter(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="bg-surface-2 border border-line rounded-lg px-4 py-2 flex-1 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="text"
          placeholder="Region bo'yicha filtr (masalan: Tashkent)"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="bg-surface-2 border border-line rounded-lg px-4 py-2 flex-1 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={handleSearch}
          className="bg-surface-2 border border-line text-ink px-4 py-2 rounded-lg hover:bg-line transition whitespace-nowrap"
        >
          Qidirish
        </button>
      </div>

      {deleteError && <p className="text-red-400 text-sm mb-4">{deleteError}</p>}
      {applyError && <p className="text-red-400 text-sm mb-4">{applyError}</p>}
      {loading && <p className="text-muted">Yuklanmoqda...</p>}
      {!loading && posts.length === 0 && (
        <p className="text-muted">Hozircha e'lonlar yo'q.</p>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canDelete={user?.id === post.author?.id}
            onDelete={handleDelete}
            deleting={deletingId === post.id}
            canApply={!!user && user.id !== post.author?.id}
            applied={appliedIds.has(post.id)}
            onApply={handleApply}
            applying={applyingId === post.id}
          />
        ))}
      </div>
    </div>
  );
}
