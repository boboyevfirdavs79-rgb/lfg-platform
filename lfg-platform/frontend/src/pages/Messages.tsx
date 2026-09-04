import { useEffect, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

type Conversation = {
  user: { id: string; username: string; steamAvatar?: string };
  lastMessage: { content: string; createdAt: string };
  unreadCount: number;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string };
  receiver: { id: string; username: string };
};

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [thread, setThread] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    const res = await api.get<Conversation[]>('/messages/conversations');
    setConversations(res.data);
  };

  const loadThread = async (otherId: string) => {
    const res = await api.get<Message[]>(`/messages/thread/${otherId}`);
    setThread(res.data);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      loadThread(userId);
      const interval = setInterval(() => loadThread(userId), 4000);
      return () => clearInterval(interval);
    } else {
      setThread([]);
    }
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId || !content.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { receiverId: userId, content });
      setContent('');
      await loadThread(userId);
      await loadConversations();
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.user.id === userId);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 grid gap-4 sm:grid-cols-[260px_1fr] h-[70vh]">
      {/* Suhbatlar ro'yxati */}
      <div className="bg-surface border border-line rounded-xl overflow-y-auto">
        {conversations.length === 0 && (
          <p className="text-muted text-sm p-4">Hozircha suhbatlaringiz yo'q.</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.user.id}
            onClick={() => navigate(`/messages/${c.user.id}`)}
            className={`w-full text-left px-4 py-3 border-b border-line hover:bg-surface-2 transition ${
              userId === c.user.id ? 'bg-surface-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{c.user.username}</span>
              {c.unreadCount > 0 && (
                <span className="text-xs bg-accent text-white rounded-full px-1.5">
                  {c.unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted truncate">{c.lastMessage.content}</p>
          </button>
        ))}
      </div>

      {/* Faol suhbat */}
      <div className="bg-surface border border-line rounded-xl flex flex-col overflow-hidden">
        {!userId ? (
          <p className="text-muted text-sm m-auto">Suhbatni tanlang</p>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-line">
              <p className="font-medium text-ink">
                {activeConversation?.user.username || 'Suhbat'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
              {thread.map((m) => {
                const isMine = m.sender.id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                      isMine
                        ? 'bg-accent text-white self-end'
                        : 'bg-surface-2 text-ink self-start'
                    }`}
                  >
                    {m.content}
                    <div
                      className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-muted'}`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-line flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Xabar yozing..."
                className="flex-1 bg-surface-2 border border-line rounded-lg px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={sending || !content.trim()}
                className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition disabled:opacity-50"
              >
                Yuborish
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
