import { create } from 'zustand';
import type { User, PublicUser, Session } from './types';
import type { UserPreferences } from '@entities/pet/types';
import { read, write, remove, StorageKeys } from '@shared/storage/localStorage';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'pet_app_salt_v1');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toPublic(user: User): PublicUser {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

interface AuthState {
  currentUser: PublicUser | null;
  isReady: boolean;

  init: () => void;
  register: (data: {
    email: string;
    password: string;
    name: string;
    city: string;
    accountType: 'person' | 'shelter';
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'city' | 'phone' | 'avatar'>>) => void;
  updatePreferences: (prefs: UserPreferences) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isReady: false,

  init: () => {
    const session = read<Session | null>(StorageKeys.session, null);
    if (!session) {
      set({ isReady: true });
      return;
    }
    const users = read<User[]>(StorageKeys.users, []);
    const user = users.find((u) => u.id === session.userId);
    set({ currentUser: user ? toPublic(user) : null, isReady: true });
  },

  register: async ({ email, password, name, city, accountType }) => {
    const emailNormalized = email.trim().toLowerCase();
    if (!emailNormalized || !password) throw new Error('Введите email и пароль');
    if (password.length < 6) throw new Error('Пароль должен быть не короче 6 символов');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      throw new Error('Некорректный email');
    }

    const users = read<User[]>(StorageKeys.users, []);
    if (users.some((u) => u.email === emailNormalized)) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const user: User = {
      id: `u${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: emailNormalized,
      passwordHash: await hashPassword(password),
      name: name.trim() || emailNormalized.split('@')[0],
      city: city.trim() || 'Не указан',
      accountType,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    write(StorageKeys.users, users);

    const session: Session = { userId: user.id, createdAt: new Date().toISOString() };
    write(StorageKeys.session, session);

    set({ currentUser: toPublic(user) });
  },

  login: async (email, password) => {
    const emailNormalized = email.trim().toLowerCase();
    if (!emailNormalized || !password) throw new Error('Введите email и пароль');

    const users = read<User[]>(StorageKeys.users, []);
    const user = users.find((u) => u.email === emailNormalized);
    if (!user) throw new Error('Пользователь не найден');

    const hash = await hashPassword(password);
    if (user.passwordHash !== hash) throw new Error('Неверный пароль');

    const session: Session = { userId: user.id, createdAt: new Date().toISOString() };
    write(StorageKeys.session, session);

    set({ currentUser: toPublic(user) });
  },

  logout: () => {
    remove(StorageKeys.session);
    set({ currentUser: null });
  },

  updateProfile: (patch) => {
    const current = get().currentUser;
    if (!current) return;
    const users = read<User[]>(StorageKeys.users, []);
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...patch };
    write(StorageKeys.users, users);
    set({ currentUser: toPublic(users[idx]) });
  },

  updatePreferences: (prefs) => {
    const current = get().currentUser;
    if (!current) return;
    const users = read<User[]>(StorageKeys.users, []);
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], preferences: prefs };
    write(StorageKeys.users, users);
    set({ currentUser: toPublic(users[idx]) });
  },
}));
