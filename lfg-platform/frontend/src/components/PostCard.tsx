type Post = {
  id: string;
  title: string;
  description: string;
  game: string;
  region?: string;
  rankLevel?: string;
  playersNeeded: number;
  createdAt: string;
  author?: { id: string; username: string };
};

type Props = {
  post: Post;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  deleting?: boolean;
  canApply?: boolean;
  applied?: boolean;
  onApply?: (id: string) => void;
  applying?: boolean;
};

export default function PostCard({
  post,
  canDelete,
  onDelete,
  deleting,
  canApply,
  applied,
  onApply,
  applying,
}: Props) {
  return (
    <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium bg-accent/15 text-accent px-2 py-1 rounded-full">
          {post.game}
        </span>
        <span className="text-xs text-muted">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-ink">{post.title}</h3>
      <p className="text-muted text-sm">{post.description}</p>
      <div className="flex flex-wrap gap-3 text-xs text-muted mt-2">
        {post.region && <span>📍 {post.region}</span>}
        {post.rankLevel && <span>🎯 {post.rankLevel}</span>}
        <span>👥 {post.playersNeeded} kishi kerak</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted">by {post.author?.username}</p>
        <div className="flex items-center gap-3">
          {canApply && (
            <button
              onClick={() => onApply?.(post.id)}
              disabled={applying || applied}
              className="text-xs bg-accent text-white px-3 py-1.5 rounded-full hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {applied ? "So'rov yuborildi" : applying ? 'Yuborilmoqda...' : "Qo'shilish"}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete?.(post.id)}
              disabled={deleting}
              className="text-xs text-red-400 hover:text-red-300 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
