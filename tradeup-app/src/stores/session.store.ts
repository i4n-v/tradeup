import { create } from 'zustand';

interface IUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface ISessionState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: IUser) => void;
  clearSession: () => void;
}

const useSessionStore = create<ISessionState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setSession: (token, user) => set({ token, user, isAuthenticated: true }),
  clearSession: () => set({ token: null, user: null, isAuthenticated: false }),
}));

export { useSessionStore };
export type { ISessionState, IUser };
