const PREFIX = 'pet_app_';

export const StorageKeys = {
  users: `${PREFIX}users`,
  session: `${PREFIX}session`,
  pets: `${PREFIX}pets`,
  swipes: `${PREFIX}swipes`,
  chats: `${PREFIX}chats`,
  stories: `${PREFIX}stories`,
  storyReactions: `${PREFIX}story_reactions`,
  viewedStories: `${PREFIX}viewed_stories`,
} as const;

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Ошибка записи в localStorage', err);
  }
}

export function remove(key: string): void {
  localStorage.removeItem(key);
}
