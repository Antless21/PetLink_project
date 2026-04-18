import { create } from 'zustand';
import type { Chat, ChatMessage } from './types';
import { read, write, StorageKeys } from '@shared/storage/localStorage';
import { useAuthStore } from '@entities/user/store';
import { usePetStore } from '@entities/pet/store';

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;

  init: () => void;
  getUserChats: () => Chat[];
  setActiveChat: (id: string | null) => void;
  createChatForPet: (petId: string) => string | null;
  sendMessage: (chatId: string, text: string) => void;
  markAsRead: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

interface StoredChat extends Chat {
  participantIds: string[];
}

function loadAll(): StoredChat[] {
  return read<StoredChat[]>(StorageKeys.chats, []);
}

function saveAll(chats: StoredChat[]) {
  write(StorageKeys.chats, chats);
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChatId: null,

  init: () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) {
      set({ chats: [], activeChatId: null });
      return;
    }
    const all = loadAll();
    const userChats = all.filter((c) => c.participantIds.includes(currentUser.id));
    set({
      chats: userChats,
      activeChatId: userChats[0]?.id ?? null,
    });
  },

  getUserChats: () => get().chats,

  setActiveChat: (id) => set({ activeChatId: id }),

  createChatForPet: (petId) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return null;

    const pet = usePetStore.getState().getById(petId);
    if (!pet) return null;
    if (pet.owner.id === currentUser.id) return null;

    const all = loadAll();
    const existing = all.find(
      (c) =>
        c.petId === petId &&
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(pet.owner.id),
    );
    if (existing) {
      set({ activeChatId: existing.id });
      return existing.id;
    }

    const newChat: StoredChat = {
      id: `c${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      petId: pet.id,
      petName: pet.name,
      petPhoto: pet.photos[0] ?? '',
      ownerName: pet.owner.name,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
      participantIds: [currentUser.id, pet.owner.id],
    };

    all.push(newChat);
    saveAll(all);

    const userChats = all.filter((c) => c.participantIds.includes(currentUser.id));
    set({ chats: userChats, activeChatId: newChat.id });
    return newChat.id;
  },

  sendMessage: (chatId, text) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser || !text.trim()) return;

    const all = loadAll();
    const idx = all.findIndex((c) => c.id === chatId);
    if (idx === -1) return;

    const message: ChatMessage = {
      id: `m${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      authorId: currentUser.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    all[idx] = {
      ...all[idx],
      messages: [...all[idx].messages, message],
      lastMessage: message.text,
      lastMessageAt: message.createdAt,
    };
    saveAll(all);

    const userChats = all.filter((c) => c.participantIds.includes(currentUser.id));
    set({ chats: userChats });
  },

  markAsRead: (chatId) => {
    const all = loadAll();
    const idx = all.findIndex((c) => c.id === chatId);
    if (idx === -1) return;
    all[idx] = {
      ...all[idx],
      unreadCount: 0,
      messages: all[idx].messages.map((m) => ({ ...m, isRead: true })),
    };
    saveAll(all);

    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    const userChats = all.filter((c) => c.participantIds.includes(currentUser.id));
    set({ chats: userChats });
  },

  deleteChat: (chatId) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    const all = loadAll();
    const target = all.find((c) => c.id === chatId);
    if (!target) return;
    if (!target.participantIds.includes(currentUser.id)) return;

    const remaining = all.filter((c) => c.id !== chatId);
    saveAll(remaining);

    const userChats = remaining.filter((c) =>
      c.participantIds.includes(currentUser.id),
    );

    const currentActive = get().activeChatId;
    const nextActive =
      currentActive === chatId ? userChats[0]?.id ?? null : currentActive;

    set({ chats: userChats, activeChatId: nextActive });
  },
}));
