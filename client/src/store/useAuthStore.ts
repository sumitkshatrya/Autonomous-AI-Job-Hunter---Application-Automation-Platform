import { create } from 'zustand';
import { api } from '../lib/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  subscriptionTier: string;
  organizationId?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('autoapply_user') || 'null'),
  token: localStorage.getItem('autoapply_token') || null,
  isAuthenticated: !!localStorage.getItem('autoapply_token'),
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('autoapply_user', JSON.stringify(user));
    localStorage.setItem('autoapply_token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('autoapply_user');
    localStorage.removeItem('autoapply_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('autoapply_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('autoapply_user');
      localStorage.removeItem('autoapply_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

