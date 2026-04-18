import { create } from 'zustand';
import type { Story, StoryReaction, StoryMediaType } from './types';
import { read, write, StorageKeys } from '@shared/storage/localStorage';
import { useAuthStore } from '@entities/user/store';
import { usePetStore } from '@entities/pet/store';

function loadReactions(): StoryReaction[] {
  return read<StoryReaction[]>(StorageKeys.storyReactions, []);
}

function saveReactions(reactions: StoryReaction[]) {
  write(StorageKeys.storyReactions, reactions);
}

function loadStoredStories(): Story[] {
  return read<Story[]>(StorageKeys.stories, []);
}

function saveStoredStories(stories: Story[]): boolean {
  try {
    localStorage.setItem(StorageKeys.stories, JSON.stringify(stories));
    return true;
  } catch {
    return false;
  }
}

function loadViewed(userId: string | null): Set<string> {
  if (!userId) return new Set();
  const raw = read<Record<string, string[]>>(StorageKeys.viewedStories, {});
  return new Set(raw[userId] ?? []);
}

function saveViewed(userId: string, viewed: Set<string>) {
  const raw = read<Record<string, string[]>>(StorageKeys.viewedStories, {});
  raw[userId] = Array.from(viewed);
  write(StorageKeys.viewedStories, raw);
}

export interface CreateStoryInput {
  petId: string;
  mediaType: StoryMediaType;
  mediaUrl: string;
  posterUrl?: string;
  caption: string;
}

interface StoryState {
  stories: Story[];
  reactions: StoryReaction[];
  viewed: Set<string>;
  activeIndex: number;

  init: () => void;
  refreshFromStorage: () => void;
  setActiveIndex: (i: number) => void;
  togglePaw: (storyId: string) => void;
  markViewed: (storyId: string) => void;
  hasUserReacted: (storyId: string) => boolean;
  createStory: (input: CreateStoryInput) => Story;
  deleteStory: (storyId: string) => void;
  getStoriesByPet: (petId: string) => Story[];
}

function enrichStory(story: Story): Story {
  const pet = usePetStore.getState().getById(story.petId);
  if (!pet) return story;
  return {
    ...story,
    petName: pet.name,
    petPhoto: pet.photos[0] ?? story.petPhoto,
    city: pet.city,
    ownerName: pet.owner.name,
    ownerType: pet.owner.type,
  };
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  reactions: [],
  viewed: new Set(),
  activeIndex: 0,

  init: () => {
    const reactions = loadReactions();
    const userId = useAuthStore.getState().currentUser?.id ?? null;
    const viewed = loadViewed(userId);
    set({ reactions, viewed });
    get().refreshFromStorage();
  },

  refreshFromStorage: () => {
    const petIds = new Set(usePetStore.getState().pets.map((p) => p.id));
    const stored = loadStoredStories();
    const valid = stored.filter((s) => petIds.has(s.petId));

    if (valid.length !== stored.length) {
      saveStoredStories(valid);
    }

    const enriched = valid
      .map(enrichStory)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    set({ stories: enriched });
  },

  setActiveIndex: (i) => {
    const stories = get().stories;
    if (stories.length === 0) {
      set({ activeIndex: 0 });
      return;
    }
    const clamped = Math.max(0, Math.min(i, stories.length - 1));
    set({ activeIndex: clamped });
    const story = stories[clamped];
    if (story) get().markViewed(story.id);
  },

  togglePaw: (storyId) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) return;

    const all = loadReactions();
    const existing = all.find(
      (r) => r.userId === userId && r.storyId === storyId,
    );

    let nextReactions: StoryReaction[];
    let delta: number;

    if (existing) {
      nextReactions = all.filter(
        (r) => !(r.userId === userId && r.storyId === storyId),
      );
      delta = -1;
    } else {
      nextReactions = [
        ...all,
        { userId, storyId, createdAt: new Date().toISOString() },
      ];
      delta = 1;
    }

    saveReactions(nextReactions);

    const stories = get().stories.map((s) =>
      s.id === storyId
        ? { ...s, pawsCount: Math.max(0, s.pawsCount + delta) }
        : s,
    );

    const stored = loadStoredStories().map((s) =>
      s.id === storyId
        ? { ...s, pawsCount: Math.max(0, s.pawsCount + delta) }
        : s,
    );
    saveStoredStories(stored);

    set({ reactions: nextReactions, stories });
  },

  markViewed: (storyId) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) return;
    const viewed = new Set(get().viewed);
    if (viewed.has(storyId)) return;
    viewed.add(storyId);
    saveViewed(userId, viewed);
    set({ viewed });
  },

  hasUserReacted: (storyId) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) return false;
    return get().reactions.some(
      (r) => r.userId === userId && r.storyId === storyId,
    );
  },

  createStory: (input) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) throw new Error('Нужно войти в аккаунт');

    const pet = usePetStore.getState().getById(input.petId);
    if (!pet) throw new Error('Питомец не найден');
    if (pet.owner.id !== currentUser.id) {
      throw new Error('Можно создавать истории только для своих питомцев');
    }

    const story: Story = {
      id: `s${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      petId: pet.id,
      petName: pet.name,
      petPhoto: pet.photos[0] ?? '',
      ownerName: pet.owner.name,
      ownerType: pet.owner.type,
      city: pet.city,
      mediaType: input.mediaType,
      mediaUrl: input.mediaUrl,
      posterUrl: input.posterUrl,
      caption: input.caption.trim(),
      createdAt: new Date().toISOString(),
      pawsCount: 0,
    };

    const stored = loadStoredStories();
    const updated = [story, ...stored];

    const ok = saveStoredStories(updated);
    if (!ok) {
      throw new Error(
        'Не удалось сохранить историю — закончилось место в браузере. Попробуйте удалить старые истории.',
      );
    }

    get().refreshFromStorage();
    return story;
  },

  deleteStory: (storyId) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    const stored = loadStoredStories();
    const target = stored.find((s) => s.id === storyId);
    if (!target) return;

    const pet = usePetStore.getState().getById(target.petId);
    if (!pet || pet.owner.id !== currentUser.id) return;

    const remaining = stored.filter((s) => s.id !== storyId);
    saveStoredStories(remaining);

    const reactions = loadReactions().filter((r) => r.storyId !== storyId);
    saveReactions(reactions);

    const { activeIndex, stories } = get();
    const newStories = stories.filter((s) => s.id !== storyId);
    const newActive =
      activeIndex >= newStories.length
        ? Math.max(0, newStories.length - 1)
        : activeIndex;

    set({ stories: newStories, reactions, activeIndex: newActive });
  },

  getStoriesByPet: (petId) => {
    return get().stories.filter((s) => s.petId === petId);
  },
}));
