import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, MapPin, Eye, EyeOff, Home, Heart, Loader2 } from 'lucide-react';
import { useAuthStore } from '@entities/user/store';
import { AuthHero } from '@widgets/AuthHero/AuthHero';
import { cn } from '@shared/lib/cn';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    city: '',
    accountType: 'person' as 'person' | 'shelter',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirect = (location.state as { from?: string })?.from ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] -mt-[1px]">
      <AuthHero
        title="Найди своего друга"
        subtitle="Присоединяйся к PetLink — сообществу, которое помогает питомцам обрести дом"
      />

      <div className="flex-1 bg-cream-50 flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">
              Регистрация
            </h2>
            <p className="text-slate-500">Создай аккаунт, чтобы начать</p>
          </div>

          <div className="space-y-3">
            <Input
              icon={<User className="w-4 h-4" />}
              placeholder="Имя"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <Input
              icon={<Mail className="w-4 h-4" />}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
              autoComplete="email"
            />
            <Input
              icon={<Lock className="w-4 h-4" />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              required
              minLength={6}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Input
              icon={<MapPin className="w-4 h-4" />}
              placeholder="Город"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
            />
          </div>

          {/* Тип аккаунта */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <AccountTypeButton
              icon={<Home className="w-4 h-4" />}
              label="Я — частное лицо"
              active={form.accountType === 'person'}
              onClick={() => setForm({ ...form, accountType: 'person' })}
            />
            <AccountTypeButton
              icon={<Heart className="w-4 h-4" />}
              label="Я — приют"
              active={form.accountType === 'shelter'}
              onClick={() => setForm({ ...form, accountType: 'shelter' })}
            />
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full py-4 rounded-full bg-coral-400 hover:bg-coral-500 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-coral-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              state={{ from: redirect }}
              className="font-bold text-coral-500 hover:text-coral-600 underline underline-offset-2"
            >
              Войти
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

interface InputProps {
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

function Input({
  icon,
  rightIcon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
}: InputProps) {
  return (
    <div className="relative">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full pl-12 pr-12 py-4 bg-white rounded-full text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-300 transition-all"
      />
      {rightIcon && (
        <span className="absolute right-5 top-1/2 -translate-y-1/2">{rightIcon}</span>
      )}
    </div>
  );
}

interface AccountTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function AccountTypeButton({ icon, label, active, onClick }: AccountTypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 py-3.5 px-3 rounded-full text-sm font-semibold transition-all',
        active
          ? 'bg-coral-400 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-cream-100 shadow-sm',
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
