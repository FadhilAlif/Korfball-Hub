import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'MANAGER' | 'COACH' | 'ATHLETE' | 'VIEWER';
  status: 'ACTIVE' | 'DISABLED';
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  athlete: any | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser, athlete?: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('korfball_auth_token') : null,
  user:
    typeof window !== 'undefined' && localStorage.getItem('korfball_auth_user')
      ? JSON.parse(localStorage.getItem('korfball_auth_user')!)
      : null,
  athlete: null,
  isAuthenticated:
    typeof window !== 'undefined' ? !!localStorage.getItem('korfball_auth_token') : false,

  setAuth: (token: string, user: AuthUser, athlete: any = null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('korfball_auth_token', token);
      localStorage.setItem('korfball_auth_user', JSON.stringify(user));
    }
    set({ token, user, athlete, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('korfball_auth_token');
      localStorage.removeItem('korfball_auth_user');
    }
    set({ token: null, user: null, athlete: null, isAuthenticated: false });
  },
}));
