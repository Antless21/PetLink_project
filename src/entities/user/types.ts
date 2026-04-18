import type { UserPreferences } from '@entities/pet/types';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  city: string;
  accountType: 'person' | 'shelter';
  phone?: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface Session {
  userId: string;
  createdAt: string;
}
