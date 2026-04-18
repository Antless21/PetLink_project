import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePetStore } from '@entities/pet/store';
import { useAuthStore } from '@entities/user/store';
import { useChatStore } from '@entities/chat/store';
import { PetCard } from '@widgets/PetCard/PetCard';
import { FiltersPanel } from '@widgets/FiltersPanel/FiltersPanel';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, RefreshCw, LogIn, SlidersHorizontal, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { calculateCompatibility } from '@shared/lib/compatibility';
import { useCitiesDistances } from '@shared/lib/useGeo';

export function FeedPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isReady = useAuthStore((s) => s.isReady);

  const pets = usePetStore((s) => s.pets);
  const filters = usePetStore((s) => s.filters);
  const swipeVersion = usePetStore((s) => s.swipeVersion);
  const { like, skip, resetSwipes, getFeed } = usePetStore();
  const createChatForPet = useChatStore((s) => s.createChatForPet);

  const [showFilters, setShowFilters] = useState(false);
  const [sortByCompatibility, setSortByCompatibility] = useState(true);
  const [sortByProximity, setSortByProximity] = useState(true);

  const preferences = currentUser?.preferences;
  const hasPreferences = Boolean(preferences);
  const userCity = currentUser?.city;
  const hasUserCity = Boolean(userCity && userCity.toLowerCase() !== 'не указан');

  const petCities = useMemo(() => pets.map((p) => p.city), [pets]);
  const distances = useCitiesDistances(
    hasUserCity && sortByProximity ? userCity : null,
    petCities,
  );

  const feed = useMemo(() => {
    const base = getFeed();

    const scored = base.map((pet) => {
      const compat = hasPreferences
        ? calculateCompatibility(pet, preferences!).percent
        : 0;

      const sameCity =
        hasUserCity &&
        pet.city &&
        pet.city.trim().toLowerCase() === userCity!.trim().toLowerCase();

      const distanceKm = distances[pet.city];
      const hasDistance = typeof distanceKm === 'number';

      let proximityScore = 0;
      if (sameCity) proximityScore = 100;
      else if (hasDistance) {
        proximityScore = Math.max(0, 100 - Math.min(distanceKm, 2000) / 20);
      }

      return { pet, compat, proximityScore, sameCity, distanceKm };
    });

    if (!hasUserCity || !sortByProximity) {
      if (!hasPreferences || !sortByCompatibility) return base;
      return scored.sort((a, b) => b.compat - a.compat).map((x) => x.pet);
    }

    const useCompat = hasPreferences && sortByCompatibility;

    return scored
      .sort((a, b) => {
        if (a.sameCity !== b.sameCity) return a.sameCity ? -1 : 1;

        if (useCompat) {
          const aScore = a.compat * 0.5 + a.proximityScore * 0.5;
          const bScore = b.compat * 0.5 + b.proximityScore * 0.5;
          if (bScore !== aScore) return bScore - aScore;
        } else {
          if (b.proximityScore !== a.proximityScore)
            return b.proximityScore - a.proximityScore;
        }
        return 0;
      })
      .map((x) => x.pet);
  }, [
    pets,
    currentUser,
    filters,
    getFeed,
    hasPreferences,
    sortByCompatibility,
    preferences,
    hasUserCity,
    sortByProximity,
    userCity,
    distances,
    swipeVersion,
  ]);

  const visiblePets = feed.slice(0, 3);
  const currentPet = visiblePets[0];

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '',
  ).length;

  function handleLike() {
    if (!currentPet) return;
    like(currentPet.id);
    createChatForPet(currentPet.id);
  }

  function handleSkip() {
    if (!currentPet) return;
    skip(currentPet.id);
  }

  function handleReset() {
    resetSwipes();
  }

  function getCompat(pet: typeof currentPet): number | undefined {
    if (!pet || !preferences) return undefined;
    return calculateCompatibility(pet, preferences).percent;
  }

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
        <h2 className="text-2xl font-extrabold mb-2">Войдите, чтобы начать</h2>
        <p className="text-slate-600 mb-6">
          Регистрация займёт меньше минуты. После входа вы увидите анкеты питомцев.
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

  return (
    <>
      <div
        className="min-h-[calc(100vh-64px)]"
        style={{
          backgroundImage: 'url(/feed-bg.png)',
          backgroundSize: '420px',
          backgroundRepeat: 'repeat',
          backgroundColor: '#FAEBE9',
        }}
      >
        <div className="max-w-md mx-auto px-4 py-4 pb-24 md:pb-6">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-sm text-sm font-semibold text-slate-700 hover:shadow-md transition-all relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-coral-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {hasPreferences && (
              <button
                onClick={() => setSortByCompatibility((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm ${
                  sortByCompatibility
                    ? 'bg-coral-500 text-white'
                    : 'bg-white text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Совместимость</span>
              </button>
            )}

            {hasUserCity && (
              <button
                onClick={() => setSortByProximity((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm ${
                  sortByProximity
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-slate-600'
                }`}
                title={`Ближе к вам (${userCity})`}
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Рядом</span>
              </button>
            )}

            <div className="flex-1" />

            {!hasPreferences && (
              <Link
                to="/preferences"
                className="text-xs font-semibold text-coral-600 hover:text-coral-700"
              >
                Настроить предпочтения
              </Link>
            )}
          </div>

        {/* Feed states */}
        {pets.length === 0 ? (
          <EmptyFeed
            title="Пока нет питомцев"
            text="Станьте первым — опубликуйте анкету своего питомца или ждите, пока это сделают другие."
            actionText="Создать анкету"
            actionTo="/create"
          />
        ) : feed.length === 0 && activeFiltersCount > 0 ? (
          <EmptyFeed
            title="Ничего не найдено"
            text="Попробуйте изменить или сбросить фильтры."
            actionText="Сбросить фильтры"
            onAction={() => {
              usePetStore.getState().clearFilters();
            }}
          />
        ) : feed.length === 0 ? (
          <EmptyFeed
            title="Ты посмотрел всех!"
            text="Скоро появятся новые. А пока загляни в чаты или начни заново."
            actionText="Начать заново"
            onAction={handleReset}
            extraAction={
              <Button onClick={() => navigate('/chats')}>Перейти в чаты</Button>
            }
          />
        ) : (
          <>
            <div className="relative w-full aspect-[3/4.6] max-h-[calc(100vh-200px)] mb-6">
              <AnimatePresence>
                {visiblePets
                  .slice()
                  .reverse()
                  .map((pet, i) => {
                    const stackIndex = visiblePets.length - 1 - i;
                    const distanceKm = distances[pet.city];
                    const sameCity = Boolean(
                      hasUserCity &&
                        pet.city &&
                        pet.city.trim().toLowerCase() ===
                          userCity!.trim().toLowerCase(),
                    );
                    return (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        stackIndex={stackIndex}
                        compatibility={stackIndex === 0 ? getCompat(pet) : undefined}
                        distanceKm={stackIndex === 0 ? distanceKm : undefined}
                        isSameCity={stackIndex === 0 ? sameCity : undefined}
                        onLike={handleLike}
                        onSkip={handleSkip}
                      />
                    );
                  })}
              </AnimatePresence>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4">
              Свайпни влево или вправо
            </p>
          </>
        )}
        </div>
      </div>

      <FiltersPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </>
  );
}

function EmptyFeed({
  title,
  text,
  actionText,
  actionTo,
  onAction,
  extraAction,
}: {
  title: string;
  text: string;
  actionText: string;
  actionTo?: string;
  onAction?: () => void;
  extraAction?: React.ReactNode;
}) {
  const button = (
    <Button onClick={onAction}>
      <RefreshCw className="w-4 h-4" />
      {actionText}
    </Button>
  );

  return (
    <div className="px-4 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <PawPrint className="w-10 h-10 text-brand-600" />
      </div>
      <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
      <p className="text-slate-600 mb-6">{text}</p>
      <div className="flex gap-3 justify-center flex-wrap">
        {actionTo ? <Link to={actionTo}><Button>{actionText}</Button></Link> : button}
        {extraAction}
      </div>
    </div>
  );
}
