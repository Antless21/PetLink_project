import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PawPrint, ChevronUp, LogIn, Plus, Film } from 'lucide-react';
import { useStoryStore } from '@entities/story/store';
import { useAuthStore } from '@entities/user/store';
import { StoryPlayer } from '@widgets/StoryPlayer/StoryPlayer';
import { CreateStoryForm } from '@widgets/CreateStoryForm/CreateStoryForm';
import { Button } from '@shared/ui/Button';

export function StoriesPage() {
  const stories = useStoryStore((s) => s.stories);
  const activeIndex = useStoryStore((s) => s.activeIndex);
  const setActiveIndex = useStoryStore((s) => s.setActiveIndex);
  const currentUser = useAuthStore((s) => s.currentUser);
  const isReady = useAuthStore((s) => s.isReady);

  const [muted, setMuted] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showCreate) return;
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (activeIndex < stories.length - 1) setActiveIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) setActiveIndex(activeIndex - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        setMuted((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, stories.length, setActiveIndex, showCreate]);

  if (!isReady) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <PawPrint className="w-10 h-10 text-brand-600" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Войдите, чтобы смотреть истории</h2>
        <p className="text-slate-600 mb-6">
          Короткие видео от питомцев — листай вверх, ставь лапки любимым.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login">
            <Button variant="secondary">
              <LogIn className="w-4 h-4" />
              Войти
            </Button>
          </Link>
          <Link to="/register">
            <Button>Зарегистрироваться</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Film className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Пока нет историй</h2>
          <p className="text-slate-600 mb-6">
            Будь первым! Загрузи короткое видео или фото своего питомца — пусть другие посмотрят, какой он классный.
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            Создать историю
          </Button>
        </div>

        {showCreate && <CreateStoryForm onClose={() => setShowCreate(false)} />}
      </>
    );
  }

  const current = stories[activeIndex];
  const next = stories[activeIndex + 1];
  const prev = stories[activeIndex - 1];

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 top-[64px] md:top-[112px] bg-black overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence mode="sync">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <StoryPlayer
                story={current}
                isActive
                isMuted={muted}
                onToggleMute={() => setMuted((v) => !v)}
                onSwipeUp={
                  next ? () => setActiveIndex(activeIndex + 1) : undefined
                }
                onSwipeDown={
                  prev ? () => setActiveIndex(activeIndex - 1) : undefined
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showHint && activeIndex === 0 && stories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-36 md:bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-xs font-semibold">
              <ChevronUp className="w-4 h-4 animate-bounce" />
              Листай вверх
            </div>
          </motion.div>
        )}

        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold">
          {activeIndex + 1} / {stories.length}
        </div>

        {/* FAB create */}
        <button
          onClick={() => setShowCreate(true)}
          className="absolute bottom-28 md:bottom-20 left-4 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
          aria-label="Создать историю"
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>
      </div>

      {showCreate && <CreateStoryForm onClose={() => setShowCreate(false)} />}
    </>
  );
}
