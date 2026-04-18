import { Sparkles } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import { compatibilityColor } from '@shared/lib/compatibility';

interface Props {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CompatibilityBadge({ percent, size = 'md', showLabel = false }: Props) {
  const { bg, text, label } = compatibilityColor(percent);

  const sizes = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-bold shadow-md',
        bg,
        text,
        sizes[size],
      )}
    >
      <Sparkles className={iconSizes[size]} strokeWidth={2.5} />
      <span>{percent}%</span>
      {showLabel && <span className="opacity-90 font-semibold">· {label}</span>}
    </div>
  );
}
