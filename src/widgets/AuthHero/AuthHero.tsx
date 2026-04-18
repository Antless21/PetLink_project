import { PawPrint } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
}

const photos = [
  {
    url: '/auth/dog.png',
    top: '10%',
    left: '40%',
    size: 220,
    z: 3,
  },
  {
    url: '/auth/cat.png',
    top: '32%',
    left: '8%',
    size: 200,
    z: 2,
  },
  {
    url: '/auth/puppy.png',
    top: '52%',
    left: '38%',
    size: 210,
    z: 1,
  },
];

export function AuthHero({ title, subtitle }: Props) {
  return (
    <div className="relative hidden md:flex flex-col overflow-hidden bg-coral-400 text-white w-1/2 self-stretch min-h-[600px]">
      {/* Декоративные волны */}
      <svg
        className="absolute inset-0 w-full h-full opacity-50"
        viewBox="0 0 600 800"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,200 Q150,120 300,180 T600,220 L600,350 Q450,280 300,340 T0,360 Z"
          fill="#F5B9A8"
        />
        <path
          d="M0,500 Q200,430 380,490 T600,520 L600,680 Q400,600 200,650 T0,680 Z"
          fill="#EC8878"
          opacity="0.55"
        />
      </svg>

      {/* Декоративные иконки лапок и сердечек */}
      <DecorIcons />

      {/* Логотип */}
      <div className="relative z-10 p-10 flex items-center gap-2">
        <PawPrint className="w-7 h-7" strokeWidth={2.5} />
        <span className="text-2xl font-extrabold tracking-tight">PetLink</span>
      </div>

      {/* Заголовок + подзаголовок */}
      <div className="relative z-10 px-10 max-w-md">
        <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
          {title}
        </h1>
        <p className="text-lg opacity-95 leading-relaxed">{subtitle}</p>
      </div>

      {/* Фотоколлаж */}
      <div className="relative z-10 flex-1">
        {photos.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full overflow-hidden ring-4 ring-white/90 shadow-xl"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              zIndex: p.z,
            }}
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DecorIcons() {
  const items = [
    { type: 'heart', top: '16%', left: '28%', size: 20, opacity: 0.85 },
    { type: 'heart', top: '44%', left: '70%', size: 26, opacity: 0.7 },
    { type: 'heart', top: '62%', left: '12%', size: 18, opacity: 0.8 },
    { type: 'heart', top: '80%', left: '62%', size: 22, opacity: 0.65 },
    { type: 'paw', top: '22%', left: '72%', size: 28, opacity: 0.55 },
    { type: 'paw', top: '50%', left: '4%', size: 32, opacity: 0.55 },
    { type: 'paw', top: '74%', left: '78%', size: 24, opacity: 0.5 },
    { type: 'paw', top: '38%', left: '58%', size: 20, opacity: 0.5 },
    { type: 'heart', top: '28%', left: '88%', size: 16, opacity: 0.7 },
    { type: 'heart', top: '8%', left: '82%', size: 14, opacity: 0.6 },
  ];

  return (
    <>
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute text-white pointer-events-none"
          style={{
            top: it.top,
            left: it.left,
            fontSize: it.size,
            opacity: it.opacity,
            zIndex: 2,
          }}
        >
          {it.type === 'heart' ? <HeartIcon size={it.size} /> : <PawIcon size={it.size} />}
        </div>
      ))}
    </>
  );
}

function HeartIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-7-4.5-9.5-9.5C1 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6 4 4.5 7.5C19 16.5 12 21 12 21z" />
    </svg>
  );
}

function PawIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="10" r="2" />
      <circle cx="9" cy="5" r="2" />
      <circle cx="15" cy="5" r="2" />
      <circle cx="19" cy="10" r="2" />
      <path d="M12 11c-3 0-5 2-5 4.5 0 2 1.5 3 3 3 1 0 1.5-.5 2-.5s1 .5 2 .5c1.5 0 3-1 3-3 0-2.5-2-4.5-5-4.5z" />
    </svg>
  );
}
