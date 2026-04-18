import { useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, X, Check, Sparkles, Home } from 'lucide-react';
import type { Pet } from '@entities/pet/types';
import { formatDistance } from '@shared/lib/geo';

interface PetCardProps {
  pet: Pet;
  onLike: () => void;
  onSkip: () => void;
  stackIndex?: number;
  compatibility?: number;
  distanceKm?: number;
  isSameCity?: boolean;
}

const SWIPE_THRESHOLD = 120;

export function PetCard({
  pet,
  onLike,
  onSkip,
  stackIndex = 0,
  compatibility,
  distanceKm,
  isSameCity,
}: PetCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const isTop = stackIndex === 0;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      setExitX(400);
      setTimeout(onLike, 200);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      setExitX(-400);
      setTimeout(onSkip, 200);
    }
  }

  const genderLabel = pet.gender === 'male' ? 'Мальчик' : 'Девочка';
  const topTags = pet.traits.slice(0, 3);

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      style={{ x, rotate, zIndex: 10 - stackIndex }}
      animate={{
        x: exitX,
        scale: 1 - stackIndex * 0.04,
        y: stackIndex * 12,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 select-none cursor-grab active:cursor-grabbing"
      whileTap={isTop ? { cursor: 'grabbing' } : undefined}
    >
      <div className="relative h-full w-full bg-coral-400 rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(216,107,90,0.45)]">
        {/* Photo area — white inset */}
        <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden bg-white aspect-[4/3]">
          <img
            src={pet.photos[0]}
            alt={pet.name}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Swipe-метки */}
          {isTop && (
            <>
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-6 right-6 px-4 py-2 rounded-2xl border-4 border-[#A8C98A] text-[#6B9A4B] font-extrabold text-2xl rotate-12 bg-white/90 pointer-events-none"
              >
                LIKE
              </motion.div>
              <motion.div
                style={{ opacity: skipOpacity }}
                className="absolute top-6 left-6 px-4 py-2 rounded-2xl border-4 border-[#E88A94] text-[#C76473] font-extrabold text-2xl -rotate-12 bg-white/90 pointer-events-none"
              >
                NOPE
              </motion.div>
            </>
          )}

          {/* Location pill */}
          {isSameCity ? (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-brand-500 shadow-md text-xs font-bold text-white flex items-center gap-1">
              <Home className="w-3 h-3" strokeWidth={2.5} />
              В вашем городе
            </div>
          ) : (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/95 shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-coral-500" strokeWidth={2.5} />
              {pet.city}
              {typeof distanceKm === 'number' && (
                <span className="text-slate-500 font-medium">
                  · {formatDistance(distanceKm)}
                </span>
              )}
            </div>
          )}

          {/* Compatibility pill */}
          {compatibility !== undefined && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-coral-500 shadow-sm text-xs font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3" strokeWidth={2.5} />
              {compatibility}%
            </div>
          )}

          {/* Link to detail */}
          {isTop && (
            <Link
              to={`/pet/${pet.id}`}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/95 shadow-sm text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
            >
              Подробнее →
            </Link>
          )}
        </div>

        {/* Info area */}
        <div className="px-5 pt-4 pb-3 text-white">
          <div className="flex items-baseline gap-3 mb-1">
            <h2 className="text-3xl font-extrabold tracking-tight">{pet.name}</h2>
            <span className="text-lg font-medium opacity-90">{pet.ageText}</span>
          </div>
          <p className="text-sm font-medium opacity-90">
            {pet.breed} · {genderLabel}
          </p>
        </div>

        {/* Tags */}
        {topTags.length > 0 && (
          <div className="mx-4 mb-3 px-3 py-2.5 rounded-2xl bg-[#F5BFB4]/60 flex flex-wrap gap-1.5">
            {topTags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-cream-50 text-xs font-semibold text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExitX(-400);
              setTimeout(onSkip, 200);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-white hover:bg-cream-50 shadow-sm active:scale-95 transition-all"
          >
            <span className="w-7 h-7 rounded-full bg-[#E88A94] flex items-center justify-center">
              <X className="w-4 h-4 text-white" strokeWidth={3} />
            </span>
            <span className="text-sm font-bold text-slate-700">Не сейчас</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setExitX(400);
              setTimeout(onLike, 200);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-white hover:bg-cream-50 shadow-sm active:scale-95 transition-all"
          >
            <span className="w-7 h-7 rounded-full bg-[#A8C98A] flex items-center justify-center">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </span>
            <span className="text-sm font-bold text-slate-700">Познакомиться</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
