import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import axios from 'axios';

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
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (err) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await api.post('/api/auth/login', { username, password });
      return response.data;
    },
    onSuccess: (data) => {
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      Cookies.set('access_token', data.access_token, { expires: 1, secure: isSecure, sameSite: 'lax' });
      Cookies.set('refresh_token', data.refresh_token, { expires: 30, secure: isSecure, sameSite: 'lax' });
      localStorage.setItem('access_token', data.access_token);
      setUser(data.user);
      queryClient.invalidateQueries();
    }
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token');
    setUser(null);
    queryClient.clear();
  };

  const refreshUser = fetchUser;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}