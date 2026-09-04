import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-surface border-b border-line px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-ink">
        Squad<span className="text-accent">Up</span>
      </Link>

      {user && (
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link to="/" className="text-muted hover:text-ink transition">
            E'lonlar
          </Link>
          <Link to="/create" className="text-muted hover:text-ink transition">
            E'lon berish
          </Link>
          <Link to="/team" className="text-muted hover:text-ink transition">
            Jamoam
          </Link>
          <Link to="/messages" className="text-muted hover:text-ink transition">
            Xabarlar
          </Link>
        </div>
      )}

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/profile"
              className="text-sm text-muted hover:text-ink transition"
            >
              {user.username}
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-sm text-muted hover:text-red-400 transition"
            >
              Chiqish
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-muted hover:text-ink transition">
              Kirish
            </Link>
            <Link
              to="/register"
              className="text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-hover transition"
            >
              Ro'yxatdan o'tish
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
