import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@entities/user/store';
import { AuthHero } from '@widgets/AuthHero/AuthHero';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirect = (location.state as { from?: string })?.from ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] -mt-[1px]">
      <AuthHero
        title="С возвращением"
        subtitle="Войди, чтобы продолжить поиск нового друга"
      />

      <div className="flex-1 bg-cream-50 flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Вход</h2>
            <p className="text-slate-500">Рады видеть тебя снова</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full pl-12 pr-4 py-4 bg-white rounded-full text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-300 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-12 pr-12 py-4 bg-white rounded-full text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-coral-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
            {loading ? 'Входим...' : 'Войти'}
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Нет аккаунта?{' '}
            <Link
              to="/register"
              state={{ from: redirect }}
              className="font-bold text-coral-500 hover:text-coral-600 underline underline-offset-2"
            >
              Зарегистрироваться
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
