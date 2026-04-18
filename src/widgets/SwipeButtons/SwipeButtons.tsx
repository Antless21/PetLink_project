import { motion } from 'framer-motion';
import { X, Heart, Undo2 } from 'lucide-react';
import { cn } from '@shared/lib/cn';

interface SwipeButtonsProps {
  onLike: () => void;
  onSkip: () => void;
  onUndo?: () => void;
  disabled?: boolean;
  canUndo?: boolean;
}

export function SwipeButtons({
  onLike,
  onSkip,
  onUndo,
  disabled,
  canUndo,
}: SwipeButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        disabled={disabled}
        onClick={onSkip}
        className={cn(
          'group flex items-center justify-center gap-2 rounded-3xl shadow-card',
          'px-6 sm:px-8 py-4 bg-accent-red text-white font-bold text-base sm:text-lg',
          'hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        )}
      >
        <X className="w-5 h-5" strokeWidth={3} />
        <span>Пропустить</span>
      </motion.button>

      {onUndo && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          disabled={!canUndo}
          onClick={onUndo}
          className={cn(
            'w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-slate-200 shadow-soft',
            'flex items-center justify-center text-slate-600',
            'hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
          )}
          title="Отменить"
        >
          <Undo2 className="w-5 h-5" />
        </motion.button>
      )}

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        disabled={disabled}
        onClick={onLike}
        className={cn(
          'group flex items-center justify-center gap-2 rounded-3xl shadow-card',
          'px-6 sm:px-8 py-4 bg-accent-green text-white font-bold text-base sm:text-lg',
          'hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        )}
      >
        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={3} />
        <span>Мне нравится</span>
      </motion.button>
    </div>
  );
}
