import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw, Home, Baby, Zap, AlertCircle, Building2 } from 'lucide-react';
import type {
  PetFilters,
  PetSpecies,
  PetGender,
  PetSize,
  EnergyLevel,
  QuickFilter,
} from '@entities/pet/types';
import { usePetStore } from '@entities/pet/store';
import { cn } from '@shared/lib/cn';
import { Button } from '@shared/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const quickFilters: { id: QuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'apartment', label: 'Для квартиры', icon: Home },
  { id: 'kids', label: 'Для детей', icon: Baby },
  { id: 'active', label: 'Активные', icon: Zap },
  { id: 'urgent', label: 'Срочно', icon: AlertCircle },
  { id: 'shelter', label: 'Из приютов', icon: Building2 },
];

function applyQuickFilter(current: PetFilters, id: QuickFilter): PetFilters {
  switch (id) {
    case 'apartment':
      return { ...current, housingType: 'apartment', size: current.size ?? 'small' };
    case 'kids':
      return { ...current, goodWithKids: true, notAggressive: true };
    case 'active':
      return { ...current, energyLevel: 'high' };
    case 'urgent':
      return { ...current, urgentOnly: true };
    case 'shelter':
      return { ...current, ownerType: 'shelter' };
  }
}

export function FiltersPanel({ isOpen, onClose }: Props) {
  const { filters, setFilters, clearFilters } = usePetStore();
  const [local, setLocal] = useState<PetFilters>(filters);

  useEffect(() => {
    if (isOpen) setLocal(filters);
  }, [isOpen, filters]);

  function apply() {
    setFilters(local);
    onClose();
  }

  function reset() {
    setLocal({});
    clearFilters();
  }

  function toggleQuick(id: QuickFilter) {
    setLocal((l) => applyQuickFilter(l, id));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <aside className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-brand-600" />
            <h2 className="font-extrabold text-lg">Фильтры</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Быстрые фильтры */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Быстрые
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleQuick(id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-brand-50 text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Основное */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Основное
            </h3>

            <Field label="Вид">
              <div className="grid grid-cols-3 gap-2">
                {(['dog', 'cat', 'other'] as PetSpecies[]).map((s) => (
                  <Pill
                    key={s}
                    active={local.species === s}
                    onClick={() =>
                      setLocal({ ...local, species: local.species === s ? undefined : s })
                    }
                  >
                    {s === 'dog' ? 'Собака' : s === 'cat' ? 'Кошка' : 'Другое'}
                  </Pill>
                ))}
              </div>
            </Field>

            <Field label="Порода (поиск)">
              <input
                value={local.breed ?? ''}
                onChange={(e) => setLocal({ ...local, breed: e.target.value || undefined })}
                placeholder="Лабрадор, овчарка..."
                className="input"
              />
            </Field>

            <Field label={`Возраст: ${local.ageMin ?? 0}–${local.ageMax ?? 20} лет`}>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={local.ageMin ?? ''}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      ageMin: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="От"
                  className="input"
                />
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={local.ageMax ?? ''}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      ageMax: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="До"
                  className="input"
                />
              </div>
            </Field>

            <Field label="Пол">
              <div className="grid grid-cols-2 gap-2">
                {(['male', 'female'] as PetGender[]).map((g) => (
                  <Pill
                    key={g}
                    active={local.gender === g}
                    onClick={() =>
                      setLocal({ ...local, gender: local.gender === g ? undefined : g })
                    }
                  >
                    {g === 'male' ? 'Мальчик' : 'Девочка'}
                  </Pill>
                ))}
              </div>
            </Field>

            <Field label="Размер">
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as PetSize[]).map((s) => (
                  <Pill
                    key={s}
                    active={local.size === s}
                    onClick={() =>
                      setLocal({ ...local, size: local.size === s ? undefined : s })
                    }
                  >
                    {s === 'small' ? 'Малый' : s === 'medium' ? 'Средний' : 'Крупный'}
                  </Pill>
                ))}
              </div>
            </Field>
          </section>

          {/* Характер */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Характер
            </h3>

            <Field label="Активность">
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as EnergyLevel[]).map((e) => (
                  <Pill
                    key={e}
                    active={local.energyLevel === e}
                    onClick={() =>
                      setLocal({
                        ...local,
                        energyLevel: local.energyLevel === e ? undefined : e,
                      })
                    }
                  >
                    {e === 'low' ? 'Спокойный' : e === 'medium' ? 'Средне' : 'Активный'}
                  </Pill>
                ))}
              </div>
            </Field>

            <CheckRow
              label="Ладит с детьми"
              checked={!!local.goodWithKids}
              onChange={(v) => setLocal({ ...local, goodWithKids: v || undefined })}
            />
            <CheckRow
              label="Ладит с другими животными"
              checked={!!local.goodWithPets}
              onChange={(v) => setLocal({ ...local, goodWithPets: v || undefined })}
            />
            <CheckRow
              label="Только не агрессивные"
              checked={!!local.notAggressive}
              onChange={(v) => setLocal({ ...local, notAggressive: v || undefined })}
            />
          </section>

          {/* Условия */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Условия
            </h3>

            <Field label="Жильё">
              <div className="grid grid-cols-2 gap-2">
                <Pill
                  active={local.housingType === 'apartment'}
                  onClick={() =>
                    setLocal({
                      ...local,
                      housingType: local.housingType === 'apartment' ? undefined : 'apartment',
                    })
                  }
                >
                  Квартира
                </Pill>
                <Pill
                  active={local.housingType === 'house'}
                  onClick={() =>
                    setLocal({
                      ...local,
                      housingType: local.housingType === 'house' ? undefined : 'house',
                    })
                  }
                >
                  Частный дом
                </Pill>
              </div>
            </Field>

            <CheckRow
              label="Может оставаться один"
              checked={!!local.canLiveAlone}
              onChange={(v) => setLocal({ ...local, canLiveAlone: v || undefined })}
            />
            <CheckRow
              label="Без опыта хозяина"
              checked={!!local.noExperienceNeeded}
              onChange={(v) => setLocal({ ...local, noExperienceNeeded: v || undefined })}
            />
          </section>

          {/* Здоровье */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Здоровье
            </h3>
            <CheckRow
              label="Только привитые"
              checked={!!local.mustBeVaccinated}
              onChange={(v) => setLocal({ ...local, mustBeVaccinated: v || undefined })}
            />
            <CheckRow
              label="Только стерилизованные"
              checked={!!local.mustBeSterilized}
              onChange={(v) => setLocal({ ...local, mustBeSterilized: v || undefined })}
            />
            <CheckRow
              label="Без хронических болезней"
              checked={!!local.noIllnesses}
              onChange={(v) => setLocal({ ...local, noIllnesses: v || undefined })}
            />
          </section>

          {/* Локация и доп */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Локация и доп.
            </h3>
            <Field label="Город">
              <input
                value={local.city ?? ''}
                onChange={(e) => setLocal({ ...local, city: e.target.value || undefined })}
                placeholder="Москва"
                className="input"
              />
            </Field>

            <Field label="Цена">
              <div className="grid grid-cols-2 gap-2">
                <Pill
                  active={local.priceType === 'free'}
                  onClick={() =>
                    setLocal({
                      ...local,
                      priceType: local.priceType === 'free' ? undefined : 'free',
                    })
                  }
                >
                  Бесплатно
                </Pill>
                <Pill
                  active={local.priceType === 'paid'}
                  onClick={() =>
                    setLocal({
                      ...local,
                      priceType: local.priceType === 'paid' ? undefined : 'paid',
                    })
                  }
                >
                  Платно
                </Pill>
              </div>
            </Field>

            <Field label="Источник">
              <div className="grid grid-cols-2 gap-2">
                <Pill
                  active={local.ownerType === 'person'}
                  onClick={() =>
                    setLocal({
                      ...local,
                      ownerType: local.ownerType === 'person' ? undefined : 'person',
                    })
                  }
                >
                  Частник
                </Pill>
                <Pill
                  active={local.ownerType === 'shelter'}
                  onClick={() =>
                    setLocal({
                      ...local,
                      ownerType: local.ownerType === 'shelter' ? undefined : 'shelter',
                    })
                  }
                >
                  Приют
                </Pill>
              </div>
            </Field>

            <CheckRow
              label="Только срочные"
              checked={!!local.urgentOnly}
              onChange={(v) => setLocal({ ...local, urgentOnly: v || undefined })}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-3 flex gap-3">
          <Button variant="secondary" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </Button>
          <Button onClick={apply} fullWidth>
            Применить
          </Button>
        </div>

        <style>{`
          .input {
            width: 100%;
            padding: 0.625rem 0.875rem;
            background: #f8fafc;
            border: 1px solid transparent;
            border-radius: 0.875rem;
            font-size: 0.875rem;
            color: #0f172a;
            transition: all 0.15s;
          }
          .input:focus {
            outline: none;
            background: white;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
          }
        `}</style>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'py-2 px-3 rounded-xl text-sm font-semibold transition-all',
        active
          ? 'bg-brand-500 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      )}
    >
      {children}
    </button>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded accent-brand-500"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}
