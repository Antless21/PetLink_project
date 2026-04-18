import { useEffect, useRef, useState } from 'react';
import { Send, ArrowLeft, MoreVertical, Trash2, X } from 'lucide-react';
import { useChatStore } from '@entities/chat/store';
import { useAuthStore } from '@entities/user/store';
import { usePetStore } from '@entities/pet/store';
import { cn } from '@shared/lib/cn';
import { formatTime } from '@shared/lib/format';

interface ChatWindowProps {
  onBack?: () => void;
}

export function ChatWindow({ onBack }: ChatWindowProps) {
  const { chats, activeChatId, sendMessage, deleteChat } = useChatStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const getPetById = usePetStore((s) => s.getById);
  const chat = chats.find((c) => c.id === activeChatId);
  const pet = chat ? getPetById(chat.petId) : undefined;

  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chat?.messages.length, activeChatId]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream-50">
        <div className="text-center px-6">
          <div className="text-5xl mb-4">🐾</div>
          <p className="text-slate-500 max-w-xs">
            Выберите чат слева, чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  function handleSend() {
    if (!text.trim() || !chat) return;
    sendMessage(chat.id, text.trim());
    setText('');
  }

  function handleDelete() {
    if (!chat) return;
    deleteChat(chat.id);
    setConfirmDelete(false);
    setMenuOpen(false);
  }

  const petSubtitle = pet
    ? `${pet.breed}${pet.ageText ? ' · ' + pet.ageText : ''}`
    : chat.ownerName;

  return (
    <div className="flex-1 flex flex-col bg-cream-50 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-cream-50 shrink-0 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {chat.petPhoto ? (
          <img
            src={chat.petPhoto}
            alt={chat.petName}
            className="w-11 h-11 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-coral-100 flex items-center justify-center text-coral-700 font-extrabold shrink-0">
            {chat.petName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-slate-900 truncate">
            {chat.petName}
          </h3>
          <p className="text-xs text-slate-500 truncate">{petSubtitle}</p>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-white transition-colors"
            aria-label="Меню чата"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-2xl shadow-lg py-1 z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить чат
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
      >
        {chat.messages.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">
            Начните общение — напишите первое сообщение
          </div>
        )}
        {chat.messages.map((m, i) => {
          const isMe = m.authorId === (currentUser?.id ?? 'me');
          const prev = chat.messages[i - 1];
          const showGap = !prev || prev.authorId !== m.authorId;
          return (
            <div
              key={m.id}
              className={cn('flex', isMe ? 'justify-end' : 'justify-start', showGap && 'mt-3')}
            >
              <div
                className={cn(
                  'max-w-[78%] sm:max-w-[65%] px-4 py-2.5 rounded-3xl shadow-sm',
                  isMe
                    ? 'bg-coral-400 text-white rounded-br-lg'
                    : 'bg-white text-slate-800 rounded-bl-lg',
                )}
              >
                <div className="flex items-end gap-2 flex-wrap">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {m.text}
                  </p>
                  <span
                    className={cn(
                      'text-[10px] shrink-0 ml-auto',
                      isMe ? 'text-white/80' : 'text-slate-400',
                    )}
                  >
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-5 py-4 bg-cream-50 shrink-0">
        <div className="flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Напишите сообщение..."
            className="flex-1 px-5 py-3 bg-white rounded-full text-sm placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-300 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-12 h-12 shrink-0 rounded-full bg-coral-400 text-white flex items-center justify-center hover:bg-coral-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-5 h-5 -ml-0.5" />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmDelete(false)}
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
              Чат с <span className="font-semibold">{chat.petName}</span> и вся переписка будут удалены. Это нельзя отменить.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-2xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
