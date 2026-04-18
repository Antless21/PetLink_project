import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import {
  MapPin,
  PawPrint,
  Volume2,
  VolumeX,
  ArrowRight,
  MoreVertical,
  Trash2,
  X,
} from 'lucide-react';
import type { Story } from '@entities/story/types';
import { useStoryStore } from '@entities/story/store';
import { useAuthStore } from '@entities/user/store';
import { usePetStore } from '@entities/pet/store';
import { cn } from '@shared/lib/cn';

interface StoryPlayerProps {
  story: Story;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const IMAGE_DURATION_MS = 5000;

function formatPaws(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}K`;
  return `${Math.round(n / 1000)}K`;
}

export function StoryPlayer({
  story,
  isActive,
  isMuted,
  onToggleMute,
  onSwipeUp,
  onSwipeDown,
}: StoryPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasUserReacted = useStoryStore((s) => s.hasUserReacted);
  const togglePaw = useStoryStore((s) => s.togglePaw);
  const deleteStory = useStoryStore((s) => s.deleteStory);
  const currentUser = useAuthStore((s) => s.currentUser);
  const pet = usePetStore((s) => s.getById(story.petId));
  const reacted = hasUserReacted(story.id);

  const isOwnStory = !!currentUser && pet?.owner.id === currentUser.id;

  const [burst, setBurst] = useState<number[]>([]);
  const burstIdRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const y = useMotionValue(0);
  const controls = useAnimation();

  const isVideo = story.mediaType === 'video';

  // Video logic
  useEffect(() => {
    if (!isVideo) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
    if (isActive) {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => undefined);
      setPaused(false);
    } else {
      v.pause();
      v.currentTime = 0;
      setProgress(0);
    }
  }, [isActive, isMuted, isVideo]);

  useEffect(() => {
    if (!isActive || !isVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (v.duration > 0) setProgress((v.currentTime / v.duration) * 100);
    };
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [isActive, isVideo]);

  // Image logic — progress via timer
  useEffect(() => {
    if (isVideo) return;
    if (!isActive) {
      setProgress(0);
      return;
    }
    if (paused) return;

    const startedAt = Date.now() - (progress / 100) * IMAGE_DURATION_MS;
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const p = Math.min(100, (elapsed / IMAGE_DURATION_MS) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else if (onSwipeUp) onSwipeUp();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isActive, isVideo, paused, onSwipeUp]);

  function handlePawClick() {
    togglePaw(story.id);
    if (!reacted) spawnBurst();
  }

  function spawnBurst() {
    const id = burstIdRef.current++;
    setBurst((prev) => [...prev, id]);
    setTimeout(() => {
      setBurst((prev) => prev.filter((x) => x !== id));
    }, 900);
  }

  function handleDoubleTap() {
    if (!reacted) togglePaw(story.id);
    spawnBurst();
  }

  function togglePlay() {
    if (isVideo) {
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) {
        v.play().catch(() => undefined);
        setPaused(false);
      } else {
        v.pause();
        setPaused(true);
      }
    } else {
      setPaused((p) => !p);
    }
  }

  async function handleDragEnd(
    _: unknown,
    info: { offset: { y: number }; velocity: { y: number } },
  ) {
    const THRESHOLD = 80;

    if (
      (info.offset.y < -THRESHOLD ||
        (info.velocity.y < -400 && info.offset.y < -20)) &&
      onSwipeUp
    ) {
      await controls.start({
        y: -window.innerHeight,
        transition: { duration: 0.2 },
      });
      onSwipeUp();
      controls.set({ y: 0 });
    } else if (
      (info.offset.y > THRESHOLD ||
        (info.velocity.y > 400 && info.offset.y > 20)) &&
      onSwipeDown
    ) {
      await controls.start({
        y: window.innerHeight,
        transition: { duration: 0.2 },
      });
      onSwipeDown();
      controls.set({ y: 0 });
    } else {
      controls.start({
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      });
    }
  }

  function handleDelete() {
    deleteStory(story.id);
    setConfirmDelete(false);
    setMenuOpen(false);
  }

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      style={{ y }}
      animate={controls}
      className="absolute inset-0 bg-black overflow-hidden touch-none"
    >
      {/* Blurred backdrop — фон из постера/фото, чтобы не было чёрных полос */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${story.posterUrl || story.mediaUrl})`,
          filter: 'blur(30px) brightness(0.5)',
          transform: 'scale(1.15)',
        }}
      />

      {isVideo ? (
        <video
          ref={videoRef}
          src={story.mediaUrl}
          poster={story.posterUrl}
          playsInline
          loop
          muted={isMuted}
          preload="auto"
          className="absolute inset-0 w-full h-full object-contain"
          onClick={togglePlay}
        />
      ) : (
        <img
          src={story.mediaUrl}
          alt={story.petName}
          className="absolute inset-0 w-full h-full object-contain"
          onClick={togglePlay}
        />
      )}

      {/* Double tap catcher */}
      <div onDoubleClick={handleDoubleTap} className="absolute inset-0 z-10" />

      {/* Paw burst */}
      {burst.map((id) => (
        <div
          key={id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-paw-burst"
        >
          <PawPrint
            className="w-28 h-28 text-coral-400 drop-shadow-2xl"
            strokeWidth={2.5}
            fill="currentColor"
          />
        </div>
      ))}

      {/* Paused overlay */}
      {paused && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <div className="w-0 h-0 border-l-[18px] border-l-white border-y-[12px] border-y-transparent ml-1" />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isVideo && (
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
            aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {isOwnStory && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
              aria-label="Меню"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl py-1 z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDelete(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить историю
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-28 md:bottom-20 z-20 flex flex-col items-center gap-5">
        <button
          onClick={handlePawClick}
          className="flex flex-col items-center gap-1"
          aria-label={reacted ? 'Убрать лапку' : 'Поставить лапку'}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90',
              reacted ? 'bg-coral-500' : 'bg-black/40 backdrop-blur-md',
            )}
          >
            <PawPrint
              className={cn(
                'w-6 h-6 transition-all',
                reacted ? 'text-white scale-110' : 'text-white',
              )}
              strokeWidth={2.5}
              fill={reacted ? 'currentColor' : 'none'}
            />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">
            {formatPaws(story.pawsCount)}
          </span>
        </button>

        <Link
          to={`/pet/${story.petId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1"
          aria-label="Открыть анкету"
        >
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white text-[10px] font-semibold drop-shadow-md">
            Анкета
          </span>
        </Link>
      </div>

      {/* Bottom info */}
      <div className="absolute left-0 right-16 bottom-24 md:bottom-16 z-20 px-4 text-white pointer-events-none">
        <div className="bg-gradient-to-t from-black/60 to-transparent -mx-4 -mb-4 pt-10 pb-4 px-4">
          <div className="flex items-center gap-2 mb-2">
            {story.petPhoto ? (
              <img
                src={story.petPhoto}
                alt={story.petName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-coral-400 flex items-center justify-center text-white text-sm font-extrabold">
                {story.petName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-base leading-tight drop-shadow-md">
                {story.petName}
              </div>
              <div className="flex items-center gap-1 text-xs text-white/85">
                <MapPin className="w-3 h-3" strokeWidth={2.5} />
                <span className="truncate">{story.city}</span>
              </div>
            </div>
          </div>
          {story.caption && (
            <p className="text-sm leading-snug drop-shadow-md">{story.caption}</p>
          )}
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
              Удалить историю?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-5">
              История будет безвозвратно удалена.
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
    </motion.div>
  );
}
