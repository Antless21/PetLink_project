import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@entities/user/store';
import { Button } from '@shared/ui/Button';
import { Check, Heart } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import type {
  UserPreferences,
  PetSpecies,
  PetSize,
  PetGender,
  EnergyLevel,
} from '@entities/pet/types';

const defaultPrefs: UserPreferences = {
  hasKids: false,
  hasOtherPets: false,
  isExperienced: false,
  livesInApartment: true,
  wantsVaccinated: true,
  canHandleIllnesses: false,
  canHandleSpecialCare: false,
};

export function PreferencesPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const updatePreferences = useAuthStore((s) => s.updatePreferences);

  const [prefs, setPrefs] = useState<UserPreferences>(
    currentUser?.preferences ?? defaultPrefs,
  );
  const [saved, setSaved] = useState(false);

  function save() {
    updatePreferences(prefs);
    setSaved(true);
    setTimeout(() => navigate('/profile'), 1200);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Сохранено!</h2>
        <p className="text-slate-600">Теперь ты будешь видеть процент совместимости</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-brand-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Предпочтения</h1>
        </div>
        <p className="text-slate-600">
          Ответьте на вопросы — мы будем показывать процент совместимости с каждым питомцем
        </p>
      </header>

      <section className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 mb-4">
        <h2 className="font-bold text-slate-900 mb-4">Кого вы ищете</h2>

        <Field label="Вид питомца (опционально)">
          <Grid cols={3}>
            {(['dog', 'cat', 'other'] as PetSpecies[]).map((s) => (
              <Pill
                key={s}
                active={prefs.species === s}
                onClick={() =>
                  setPrefs({ ...prefs, species: prefs.species === s ? undefined : s })
                }
              >
                {s === 'dog' ? 'Собака' : s === 'cat' ? 'Кошка' : 'Другое'}
              </Pill>
            ))}
          </Grid>
        </Field>

        <Field label="Размер">
          <Grid cols={3}>
            {(['small', 'medium', 'large'] as PetSize[]).map((s) => (
              <Pill
                key={s}
                active={prefs.preferredSize === s}
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    preferredSize: prefs.preferredSize === s ? undefined : s,
                  })
                }
              >
                {s === 'small' ? 'Малый' : s === 'medium' ? 'Средний' : 'Крупный'}
              </Pill>
            ))}
          </Grid>
        </Field>

        <Field label="Активность">
          <Grid cols={3}>
            {(['low', 'medium', 'high'] as EnergyLevel[]).map((e) => (
              <Pill
                key={e}
                active={prefs.preferredEnergy === e}
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    preferredEnergy: prefs.preferredEnergy === e ? undefined : e,
                  })
                }
              >
                {e === 'low' ? 'Спокойный' : e === 'medium' ? 'Средний' : 'Активный'}
              </Pill>
            ))}
          </Grid>
        </Field>

        <Field label="Пол">
          <Grid cols={2}>
            {(['male', 'female'] as PetGender[]).map((g) => (
              <Pill
                key={g}
                active={prefs.preferredGender === g}
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    preferredGender: prefs.preferredGender === g ? undefined : g,
                  })
                }
              >
                {g === 'male' ? 'Мальчик' : 'Девочка'}
              </Pill>
            ))}
          </Grid>
        </Field>

        <Field label="Возраст, лет">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              max={30}
              placeholder="От"
              value={prefs.ageMin ?? ''}
              onChange={(e) =>
                setPrefs({ ...prefs, ageMin: e.target.value ? Number(e.target.value) : undefined })
              }
              className="input"
            />
            <input
              type="number"
              min={0}
              max={30}
              placeholder="До"
              value={prefs.ageMax ?? ''}
              onChange={(e) =>
                setPrefs({ ...prefs, ageMax: e.target.value ? Number(e.target.value) : undefined })
              }
              className="input"
            />
          </div>
        </Field>
      </section>

      <section className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 mb-4">
        <h2 className="font-bold text-slate-900 mb-4">О вас</h2>

        <CheckOption
          label="У меня есть дети"
          desc="Покажем только тех, кто хорошо ладит с детьми"
          value={prefs.hasKids}
          onChange={(v) => setPrefs({ ...prefs, hasKids: v })}
        />
        <CheckOption
          label="У меня уже есть животные"
          desc="Покажем тех, кто уживается с другими"
          value={prefs.hasOtherPets}
          onChange={(v) => setPrefs({ ...prefs, hasOtherPets: v })}
        />
        <CheckOption
          label="Я опытный хозяин"
          desc="Можете справиться со сложным характером"
          value={prefs.isExperienced}
          onChange={(v) => setPrefs({ ...prefs, isExperienced: v })}
        />
        <CheckOption
          label="Живу в квартире"
          desc="Подберём питомца, подходящего для квартиры"
          value={prefs.livesInApartment}
          onChange={(v) => setPrefs({ ...prefs, livesInApartment: v })}
        />
      </section>

      <section className="bg-white rounded-3xl shadow-soft border border-slate-100 p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4">Здоровье</h2>

        <CheckOption
          label="Важно, чтобы был привит"
          value={prefs.wantsVaccinated}
          onChange={(v) => setPrefs({ ...prefs, wantsVaccinated: v })}
        />
        <CheckOption
          label="Готов взять с хроническими болезнями"
          value={prefs.canHandleIllnesses}
          onChange={(v) => setPrefs({ ...prefs, canHandleIllnesses: v })}
        />
        <CheckOption
          label="Готов к особому уходу"
          value={prefs.canHandleSpecialCare}
          onChange={(v) => setPrefs({ ...prefs, canHandleSpecialCare: v })}
        />
      </section>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={() => navigate('/profile')}>
          Отмена
        </Button>
        <Button size="lg" onClick={save}>
          Сохранить
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
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
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
        'py-2.5 px-3 rounded-2xl text-sm font-semibold transition-all',
        active ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      )}
    >
      {children}
    </button>
  );
}

function CheckOption({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 py-3 cursor-pointer select-none hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded accent-brand-500 mt-0.5 shrink-0"
      />
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
      </div>
    </label>
  );
}
