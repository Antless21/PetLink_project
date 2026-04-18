import { useChatStore } from '@entities/chat/store';
import { cn } from '@shared/lib/cn';
import { formatDate } from '@shared/lib/format';
import { Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface ChatSidebarProps {
  onSelect?: (chatId: string) => void;
}

export function ChatSidebar({ onSelect }: ChatSidebarProps) {
  const { chats, activeChatId, setActiveChat, markAsRead, deleteChat } = useChatStore();
  const [query, setQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = chats.filter(
    (c) =>
      c.petName.toLowerCase().includes(query.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(query.toLowerCase()),
  );

  const chatToDelete = confirmDeleteId
    ? chats.find((c) => c.id === confirmDeleteId)
    : null;

  function handleSelect(id: string) {
    setActiveChat(id);
    markAsRead(id);
    onSelect?.(id);
  }

  function handleConfirmDelete() {
    if (!confirmDeleteId) return;
    deleteChat(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  return (
    <aside className="flex flex-col h-full bg-cream-50 px-4 py-4 gap-3">
      {/* Search */}
      <div className="relative shrink-0">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск"
          className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-300 transition-all"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-500">
            {chats.length === 0
              ? 'Пока нет чатов. Лайкни питомца в ленте, чтобы начать общение.'
              : 'Чаты не найдены'}
          </div>
        )}
        {filtered.map((chat) => {
          const active = activeChatId === chat.id;
          return (
            <div
              key={chat.id}
              className={cn(
                'group relative w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors',
                active
                  ? 'bg-coral-200/70 shadow-sm'
                  : 'bg-white hover:bg-cream-100 shadow-sm',
              )}
            >
              <button
                onClick={() => handleSelect(chat.id)}
                className="flex-1 flex items-center gap-3 text-left min-w-0"
              >
                <div className="relative shrink-0">
                  {chat.petPhoto ? (
                    <img
                      src={chat.petPhoto}
                      alt={chat.petName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center text-coral-700 font-extrabold">
                      {chat.petName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 truncate text-sm">
                      {chat.petName}
                    </h3>
                    <span className="text-xs text-slate-500 shrink-0 font-medium">
                      {chat.lastMessageAt ? formatDate(chat.lastMessageAt) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-slate-600 truncate">
                      {chat.lastMessage || 'Нет сообщений'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-coral-400 text-white text-[10px] font-bold flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(chat.id);
                }}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-60 md:opacity-0 md:group-hover:opacity-100"
                title="Удалить чат"
                aria-label="Удалить чат"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm delete modal */}
      {chatToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>

            <h3 className="text-lg font-extrabold text-center text-slate-900 mb-1">
              Удалить чат?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-5">
              Чат с <span className="font-semibold">{chatToDelete.petName}</span> и вся переписка будут удалены. Это нельзя отменить.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-2xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
