import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, MessageCircle, Shield, Check, Calendar, AlertCircle, Zap, Users, Baby, Home, Heart } from 'lucide-react';
import { usePetStore } from '@entities/pet/store';
import { useAuthStore } from '@entities/user/store';
import { useChatStore } from '@entities/chat/store';
import { Button } from '@shared/ui/Button';
import { Chip } from '@shared/ui/Chip';
import { CompatibilityBadge } from '@widgets/CompatibilityBadge/CompatibilityBadge';
import { calculateCompatibility } from '@shared/lib/compatibility';

export function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = usePetStore((s) => s.pets.find((p) => p.id === id));
  const like = usePetStore((s) => s.like);
  const currentUser = useAuthStore((s) => s.currentUser);
  const createChatForPet = useChatStore((s) => s.createChatForPet);

  function handleContact() {
    if (!currentUser) {
      navigate('/login', { state: { from: `/pet/${id}` } });
      return;
    }
    if (!pet) return;
    if (pet.owner.id === currentUser.id) {
      navigate('/profile');
      return;
    }
    like(pet.id);
    const chatId = createChatForPet(pet.id);
    if (chatId) navigate('/chats');
  }

  const compatibility =
    pet && currentUser?.preferences
      ? calculateCompatibility(pet, currentUser.preferences)
      : null;

  if (!pet) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Питомец не найден</p>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-24 md:pb-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 py-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      {/* Photo */}
      <div className="relative rounded-4xl overflow-hidden shadow-card mb-6 bg-slate-100 aspect-[4/3]">
        <img
          src={pet.photos[0]}
          alt={pet.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass text-sm font-medium text-slate-800 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {pet.city}
        </div>
        {compatibility && (
          <div className="absolute top-4 right-4">
            <CompatibilityBadge percent={compatibility.percent} size="lg" showLabel />
          </div>
        )}
        {pet.isUrgent && (
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-accent-red text-white text-sm font-bold flex items-center gap-1.5 shadow-md">
            <AlertCircle className="w-4 h-4" />
            Срочно
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
          {pet.name}
        </h1>
        <p className="text-lg text-slate-600">
          {pet.breed} · {pet.ageText}
        </p>
      </div>

      {/* Compatibility breakdown */}
      {compatibility && compatibility.breakdown.length > 0 && (
        <section className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-brand-600" />
            <h2 className="font-extrabold text-lg">Совместимость с вами</h2>
          </div>
          {compatibility.matchedCriteria.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Совпадает
              </p>
              <div className="flex flex-wrap gap-1.5">
                {compatibility.matchedCriteria.map((c) => (
                  <Chip key={c} variant="success">
                    <Check className="w-3 h-3" />
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          )}
          {compatibility.mismatchedCriteria.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Обратите внимание
              </p>
              <div className="flex flex-wrap gap-1.5">
                {compatibility.mismatchedCriteria.map((c) => (
                  <Chip key={c} variant="warning">
                    <AlertCircle className="w-3 h-3" />
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Возраст" value={pet.ageText} icon={<Calendar className="w-5 h-5" />} />
        <StatCard
          label="Пол"
          value={pet.gender === 'male' ? 'Мальчик' : 'Девочка'}
        />
        <StatCard
          label="Размер"
          value={
            pet.size === 'small'
              ? 'Маленький'
              : pet.size === 'medium'
                ? 'Средний'
                : 'Крупный'
          }
        />
        <StatCard
          label="Активность"
          value={
            pet.energyLevel === 'low'
              ? 'Спокойный'
              : pet.energyLevel === 'medium'
                ? 'Средняя'
                : 'Высокая'
          }
          icon={<Zap className="w-5 h-5" />}
        />
      </div>

      {/* Behaviour & housing chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {pet.isVaccinated && (
          <Chip variant="success">
            <Check className="w-3 h-3" /> Привит
          </Chip>
        )}
        {pet.isSterilized && (
          <Chip variant="success">
            <Check className="w-3 h-3" /> Стерилизован
          </Chip>
        )}
        {pet.goodWithKids && (
          <Chip variant="accent">
            <Baby className="w-3 h-3" /> Ладит с детьми
          </Chip>
        )}
        {pet.goodWithPets && (
          <Chip variant="accent">
            <Users className="w-3 h-3" /> Ладит с животными
          </Chip>
        )}
        {pet.housingType === 'apartment' && (
          <Chip variant="accent">
            <Home className="w-3 h-3" /> Для квартиры
          </Chip>
        )}
        {pet.housingType === 'house' && (
          <Chip variant="accent">
            <Home className="w-3 h-3" /> Для дома
          </Chip>
        )}
        {pet.needsExperienced && (
          <Chip variant="warning">Нужен опытный хозяин</Chip>
        )}
        {pet.hasIllnesses && (
          <Chip variant="warning">Есть болезни</Chip>
        )}
        {pet.traits.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>

      {/* About */}
      <section className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 mb-6">
        <h2 className="font-extrabold text-lg mb-3 text-slate-900">О питомце</h2>
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
          {pet.description}
        </p>
      </section>

      {/* Owner */}
      <section className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 mb-6">
        <h2 className="font-extrabold text-lg mb-3 text-slate-900">
          {pet.owner.type === 'shelter' ? 'Приют' : 'Владелец'}
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{pet.owner.name}</p>
            <p className="text-sm text-slate-500">
              {pet.owner.type === 'shelter' ? 'Проверенный приют' : 'Частное лицо'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="sticky bottom-4 md:static">
        <Button size="lg" fullWidth className="shadow-card" onClick={handleContact}>
          <MessageCircle className="w-5 h-5" />
          {pet.owner.id === currentUser?.id
            ? 'Это ваша анкета'
            : 'Связаться с владельцем'}
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}
