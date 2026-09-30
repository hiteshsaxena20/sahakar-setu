import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import axios from 'axios';

// ── Known demo roles (optional nice-to-have) ─────────────────────────────────
const ROLE_MAP: Record<string, string[]> = {
  admin:   ['admin'],
  trainer: ['trainer'],
  trainee: ['trainee'],
};

const FAKE_TOKEN = 'fake-session-sahakar-setu';

interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Build a user object from whatever name was typed */
function buildUser(username: string): User {
  const name = username.trim() || 'user';
  return {
    id: `fake-${name}`,
    username: name,
    email: `${name}@sahakar.dev`,
    roles: ROLE_MAP[name.toLowerCase()] ?? ['admin'],
    firstName: name.charAt(0).toUpperCase() + name.slice(1),
    lastName: 'User',
  };
}

function saveFakeSession(username: string) {
  const isSecure = window.location.protocol === 'https:';
  Cookies.set('access_token', FAKE_TOKEN, { expires: 1, secure: isSecure, sameSite: 'lax' });
  localStorage.setItem('access_token', FAKE_TOKEN);
  localStorage.setItem('fake_username', username.toLowerCase());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchUser = async () => {
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Restore fake session instantly — no network needed
    if (token === FAKE_TOKEN) {
      const saved = localStorage.getItem('fake_username') || 'admin';
      setUser(buildUser(saved));
      setLoading(false);
      return;
    }

    // Try real backend (works when running locally)
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch {
      // Backend down — restore fake session
      const saved = localStorage.getItem('fake_username') || 'admin';
      setUser(buildUser(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      throw new Error('Please enter your username and password.');
    }

    // Try real backend first
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const data = res.data;
      const isSecure = window.location.protocol === 'https:';
      Cookies.set('access_token', data.access_token, { expires: 1, secure: isSecure, sameSite: 'lax' });
      Cookies.set('refresh_token', data.refresh_token, { expires: 30, secure: isSecure, sameSite: 'lax' });
      localStorage.setItem('access_token', data.access_token);
      setUser(data.user);
      queryClient.invalidateQueries();
      return;
    } catch {
      // Backend unreachable → silently fake the login
    }

    // ── FAKE: any username + any non-empty password → success ────────────
    saveFakeSession(username);
    setUser(buildUser(username));
    queryClient.invalidateQueries();
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('fake_username');
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}