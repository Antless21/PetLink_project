import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { usePetStore } from '@entities/pet/store';
import { resizeImage } from '@shared/lib/image';
import { geocodeCity } from '@shared/lib/geo';
import type {
  Pet,
  PetGender,
  PetSize,
  PetSpecies,
  EnergyLevel,
  HousingType,
  PriceType,
} from '@entities/pet/types';
import { cn } from '@shared/lib/cn';

interface Props {
  initialPet?: Pet;
}

interface FormState {
  name: string;
  age: string;
  breed: string;
  species: PetSpecies;
  gender: PetGender;
  size: PetSize;
  city: string;
  description: string;
  traits: string;
  energyLevel: EnergyLevel;
  isFriendly: boolean;
  isAggressive: boolean;
  goodWithKids: boolean;
  goodWithPets: boolean;
  housingType: HousingType;
  canLiveAlone: boolean;
  needsExperienced: boolean;
  isVaccinated: boolean;
  isSterilized: boolean;
  hasIllnesses: boolean;
  needsSpecialCare: boolean;
  priceType: PriceType;
  isUrgent: boolean;
}

function initFromPet(p?: Pet): FormState {
  return {
    name: p?.name ?? '',
    age: p ? String(p.age) : '',
    breed: p?.breed ?? '',
    species: p?.species ?? 'dog',
    gender: p?.gender ?? 'male',
    size: p?.size ?? 'medium',
    city: p?.city ?? '',
    description: p?.description ?? '',
    traits: p?.traits.join(', ') ?? '',
    energyLevel: p?.energyLevel ?? 'medium',
    isFriendly: p?.isFriendly ?? true,
    isAggressive: p?.isAggressive ?? false,
    goodWithKids: p?.goodWithKids ?? false,
    goodWithPets: p?.goodWithPets ?? false,
    housingType: p?.housingType ?? 'any',
    canLiveAlone: p?.canLiveAlone ?? false,
    needsExperienced: p?.needsExperienced ?? false,
    isVaccinated: p?.isVaccinated ?? false,
    isSterilized: p?.isSterilized ?? false,
    hasIllnesses: p?.hasIllnesses ?? false,
    needsSpecialCare: p?.needsSpecialCare ?? false,
    priceType: p?.priceType ?? 'free',
    isUrgent: p?.isUrgent ?? false,
  };
}

export function CreatePetForm({ initialPet }: Props) {
  const navigate = useNavigate();
  const { createPet, updatePet } = usePetStore();
  const isEdit = Boolean(initialPet);

  const [photos, setPhotos] = useState<string[]>(initialPet?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(initFromPet(initialPet));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await Promise.all(files.map((f) => resizeImage(f, 1000, 0.82)));
      setPhotos((p) => [...p, ...compressed].slice(0, 4));
    } catch {
      setError('Не удалось загрузить фото');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (photos.length === 0) return setError('Добавьте хотя бы одно фото');
    const age = parseInt(form.age, 10);
    if (!form.name.trim()) return setError('Укажите имя');
    if (isNaN(age) || age < 0 || age > 30) return setError('Укажите корректный возраст');

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        age,
        breed: form.breed.trim() || 'Метис',
        species: form.species,
        gender: form.gender,
        size: form.size,
        city: form.city.trim() || 'Не указан',
        description: form.description.trim(),
        traits: form.traits
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 4),
        photos,
        energyLevel: form.energyLevel,
        isFriendly: form.isFriendly,
        isAggressive: form.isAggressive,
        goodWithKids: form.goodWithKids,
        goodWithPets: form.goodWithPets,
        housingType: form.housingType,
        canLiveAlone: form.canLiveAlone,
        needsExperienced: form.needsExperienced,
        isVaccinated: form.isVaccinated,
        isSterilized: form.isSterilized,
        hasIllnesses: form.hasIllnesses,
        needsSpecialCare: form.needsSpecialCare,
        priceType: form.priceType,
        isUrgent: form.isUrgent,
      };
      if (isEdit && initialPet) {
        updatePet(initialPet.id, payload);
      } else {
        createPet(payload);
      }
      const cityToGeocode = payload.city;
      if (cityToGeocode && cityToGeocode.toLowerCase() !== 'не указан') {
        geocodeCity(cityToGeocode).catch(() => undefined);
      }
      setSubmitted(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">
          {isEdit ? 'Анкета обновлена!' : 'Анкета опубликована!'}
        </h2>
        <p className="text-slate-600">Возвращаемся в профиль...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Фото */}
      <Section title="Фото" subtitle="до 4 штук">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group bg-slate-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {photos.length < 4 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">Загрузить</span>
                </>
              )}
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
            </label>
          )}
        </div>
      </Section>

      {/* Основное */}
      <Section title="Основное">
        <Grid>
          <Field label="Имя">
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Бим" className="input" />
          </Field>
          <Field label="Возраст (лет)">
            <input required type="number" min={0} max={30} value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="2" className="input" />
          </Field>
          <Field label="Вид">
            <select value={form.species} onChange={(e) => update('species', e.target.value as PetSpecies)} className="input">
              <option value="dog">Собака</option>
              <option value="cat">Кошка</option>
              <option value="other">Другое</option>
            </select>
          </Field>
          <Field label="Порода">
            <input value={form.breed} onChange={(e) => update('breed', e.target.value)} placeholder="Лабрадор" className="input" />
          </Field>
          <Field label="Пол">
            <PillGroup
              options={[
                { value: 'male', label: 'Мальчик' },
                { value: 'female', label: 'Девочка' },
              ]}
              value={form.gender}
              onChange={(v) => update('gender', v)}
            />
          </Field>
          <Field label="Размер">
            <PillGroup
              options={[
                { value: 'small', label: 'Малый' },
                { value: 'medium', label: 'Средний' },
                { value: 'large', label: 'Крупный' },
              ]}
              value={form.size}
              onChange={(v) => update('size', v)}
            />
          </Field>
          <Field label="Город" full>
            <input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Москва" className="input" />
          </Field>
          <Field label="Описание" full>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Расскажите о питомце..." rows={3} className="input resize-none" />
          </Field>
          <Field label="Краткие черты (через запятую, до 4)" full>
            <input value={form.traits} onChange={(e) => update('traits', e.target.value)} placeholder="Спокойный, Ладит с детьми" className="input" />
          </Field>
        </Grid>
      </Section>

      {/* Характер */}
      <Section title="Характер и поведение">
        <Grid>
          <Field label="Активность" full>
            <PillGroup
              options={[
                { value: 'low', label: 'Спокойный' },
                { value: 'medium', label: 'Средний' },
                { value: 'high', label: 'Активный' },
              ]}
              value={form.energyLevel}
              onChange={(v) => update('energyLevel', v)}
            />
          </Field>
        </Grid>
        <div className="grid md:grid-cols-2 gap-2 mt-2">
          <CheckBox label="Дружелюбный" checked={form.isFriendly} onChange={(v) => update('isFriendly', v)} />
          <CheckBox label="Ладит с детьми" checked={form.goodWithKids} onChange={(v) => update('goodWithKids', v)} />
          <CheckBox label="Ладит с другими животными" checked={form.goodWithPets} onChange={(v) => update('goodWithPets', v)} />
          <CheckBox label="Может проявлять агрессию" checked={form.isAggressive} onChange={(v) => update('isAggressive', v)} warning />
        </div>
      </Section>

      {/* Условия */}
      <Section title="Условия содержания">
        <Grid>
          <Field label="Подходящее жильё" full>
            <PillGroup
              options={[
                { value: 'any', label: 'Любое' },
                { value: 'apartment', label: 'Квартира' },
                { value: 'house', label: 'Частный дом' },
              ]}
              value={form.housingType}
              onChange={(v) => update('housingType', v)}
            />
          </Field>
        </Grid>
        <div className="grid md:grid-cols-2 gap-2 mt-2">
          <CheckBox label="Может оставаться один" checked={form.canLiveAlone} onChange={(v) => update('canLiveAlone', v)} />
          <CheckBox label="Нужен опытный хозяин" checked={form.needsExperienced} onChange={(v) => update('needsExperienced', v)} />
        </div>
      </Section>

      {/* Здоровье */}
      <Section title="Здоровье">
        <div className="grid md:grid-cols-2 gap-2">
          <CheckBox label="Привит" checked={form.isVaccinated} onChange={(v) => update('isVaccinated', v)} />
          <CheckBox label="Стерилизован / кастрирован" checked={form.isSterilized} onChange={(v) => update('isSterilized', v)} />
          <CheckBox label="Есть хронические болезни" checked={form.hasIllnesses} onChange={(v) => update('hasIllnesses', v)} warning />
          <CheckBox label="Требует особого ухода" checked={form.needsSpecialCare} onChange={(v) => update('needsSpecialCare', v)} />
        </div>
      </Section>

      {/* Доп */}
      <Section title="Дополнительно">
        <Grid>
          <Field label="Цена" full>
            <PillGroup
              options={[
                { value: 'free', label: 'Бесплатно' },
                { value: 'paid', label: 'Платно' },
              ]}
              value={form.priceType}
              onChange={(v) => update('priceType', v)}
            />
          </Field>
        </Grid>
        <div className="mt-2">
          <CheckBox label="Срочно нужен новый дом" checked={form.isUrgent} onChange={(v) => update('isUrgent', v)} warning />
        </div>
      </Section>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
          Отмена
        </Button>
        <Button type="submit" size="lg" disabled={submitting || uploading}>
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {submitting ? (isEdit ? 'Сохраняем...' : 'Публикуем...') : isEdit ? 'Сохранить' : 'Опубликовать'}
        </Button>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid transparent;
          border-radius: 1rem;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .input:focus {
          outline: none;
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
      `}</style>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6">
      <h3 className="font-bold text-slate-900 mb-4">
        {title}
        {subtitle && <span className="font-normal text-slate-400"> · {subtitle}</span>}
      </h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2' : undefined}>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'py-2.5 px-3 rounded-2xl text-sm font-semibold transition-all',
            value === o.value ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CheckBox({
  label,
  checked,
  onChange,
  warning,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  warning?: boolean;
}) {
  return (
    <label className={cn(
      'flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer select-none transition-colors',
      checked && warning ? 'bg-amber-50' : checked ? 'bg-brand-50' : 'hover:bg-slate-50'
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn('w-5 h-5 rounded shrink-0', warning ? 'accent-amber-500' : 'accent-brand-500')}
      />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}
