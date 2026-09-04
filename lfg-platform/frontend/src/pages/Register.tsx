import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/getErrorMessage';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password, region);
      navigate('/');
    } catch (err: any) {
      setError(getErrorMessage(err, "Ro'yxatdan o'tishda xatolik yuz berdi"));
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 bg-surface border border-line rounded-xl">
      <h1 className="text-2xl font-semibold mb-6 text-ink">
        Ro'yxatdan o'tish
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-surface-2 border border-line rounded-lg px-4 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-surface-2 border border-line rounded-lg px-4 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="password"
          placeholder="Parol (kamida 6 belgi)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-surface-2 border border-line rounded-lg px-4 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="text"
          placeholder="Region (masalan: Tashkent)"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
          className="bg-surface-2 border border-line rounded-lg px-4 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {error && (
          <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
        )}
        <button
          type="submit"
          className="bg-accent text-white rounded-lg py-2 font-medium hover:bg-accent-hover transition"
        >
          Ro'yxatdan o'tish
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        Akkountingiz bormi?{' '}
        <Link to="/login" className="text-accent font-medium">
          Kirish
        </Link>
      </p>
    </div>
  );
}
