import { useNavigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Heart, MessageCircle, PawPrint, LogOut, Plus, Trash2, Pencil, MapPin, Sparkles } from 'lucide-react';
import { useAuthStore } from '@entities/user/store';
import { usePetStore } from '@entities/pet/store';
import { useChatStore } from '@entities/chat/store';
import { read, StorageKeys } from '@shared/storage/localStorage';
import { Button } from '@shared/ui/Button';
import { Chip } from '@shared/ui/Chip';

interface SwipeRecord {
  userId: string;
  petId: string;
  direction: 'like' | 'skip';
  createdAt: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { getMyPets, deletePet } = usePetStore();
  const chatsCount = useChatStore((s) => s.chats.length);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const myPets = getMyPets();

  const likesCount = useMemo(() => {
    if (!currentUser) return 0;
    const all = read<SwipeRecord[]>(StorageKeys.swipes, []);
    return all.filter((s) => s.userId === currentUser.id && s.direction === 'like').length;
  }, [currentUser, myPets.length]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      deletePet(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  if (!currentUser) return null;

  const initial = currentUser.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-slate-900 truncate">
            {currentUser.name}
          </h1>
          <p className="text-sm text-slate-500 truncate">
            {currentUser.email} · {currentUser.city}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentUser.accountType === 'shelter' ? 'Приют' : 'Частное лицо'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBlock label="Анкет" value={myPets.length} icon={<PawPrint className="w-5 h-5" />} color="orange" />
        <StatBlock label="Чатов" value={chatsCount} icon={<MessageCircle className="w-5 h-5" />} color="blue" />
        <StatBlock label="Лайков" value={likesCount} icon={<Heart className="w-5 h-5" />} color="red" />
      </div>

      {/* Предпочтения */}
      <Link
        to="/preferences"
        className="block bg-gradient-to-r from-brand-50 to-brand-100 rounded-3xl border border-brand-200 p-5 mb-6 hover:shadow-card transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900">
              {currentUser.preferences ? 'Мои предпочтения' : 'Настроить совместимость'}
            </h3>
            <p className="text-sm text-slate-600">
              {currentUser.preferences
                ? 'Обновить, кого вы ищете'
                : 'Заполните анкету и увидите процент совместимости с каждым питомцем'}
            </p>
          </div>
          <span className="text-brand-600 text-2xl group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </Link>

      {/* Мои анкеты */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-extrabold text-slate-900">Мои анкеты</h2>
          <Button size="sm" onClick={() => navigate('/create')}>
            <Plus className="w-4 h-4" />
            Добавить
          </Button>
        </div>

        {myPets.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <PawPrint className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-4">У вас пока нет анкет</p>
            <Button onClick={() => navigate('/create')}>
              <Plus className="w-4 h-4" />
              Создать первую
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {myPets.map((pet) => (
              <article
                key={pet.id}
                className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden"
              >
                <Link to={`/pet/${pet.id}`} className="block relative">
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={pet.photos[0]}
                      alt={pet.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass text-xs font-medium text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {pet.city}
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="font-extrabold text-slate-900 text-lg truncate">
                    {pet.name}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {pet.breed} · {pet.ageText}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.traits.slice(0, 2).map((t) => (
                      <Chip key={t} variant="accent">{t}</Chip>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/edit/${pet.id}`)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        confirmDelete === pet.id
                          ? 'bg-accent-red text-white'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {confirmDelete === pet.id ? 'Точно?' : ''}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Button variant="secondary" fullWidth onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
        Выйти из аккаунта
      </Button>
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'blue' | 'orange';
}) {
  const colorMap = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-brand-50 text-brand-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mx-auto mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  );
}
