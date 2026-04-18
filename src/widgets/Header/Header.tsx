import { Link, NavLink, useLocation } from 'react-router-dom';
import { PawPrint, Heart, MessageCircle, Plus, LogIn, Film } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import { useChatStore } from '@entities/chat/store';
import { useAuthStore } from '@entities/user/store';

const navItems = [
  { to: '/', label: 'Лента', icon: Heart },
  { to: '/stories', label: 'Истории', icon: Film },
  { to: '/chats', label: 'Чаты', icon: MessageCircle },
  { to: '/create', label: 'Создать', icon: Plus },
];

export function Header() {
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const totalUnread = useChatStore((s) =>
    s.chats.reduce((sum, c) => sum + c.unreadCount, 0),
  );

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-coral-400 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left — Чаты label on chat page, otherwise hidden spacer */}
          <div className="flex-1 flex items-center">
            {location.pathname === '/chats' && (
              <h2 className="text-white text-xl font-extrabold hidden sm:block">Чаты</h2>
            )}
          </div>

          {/* Center — brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <PawPrint className="w-6 h-6 text-white" strokeWidth={2.5} />
            <span className="font-extrabold text-xl text-white tracking-tight">
              PetLink
            </span>
          </Link>

          {/* Right — actions */}
          <div className="flex-1 flex items-center justify-end gap-2">
            {currentUser ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-coral-500 text-xs font-extrabold">
                  {currentUser.name.trim().charAt(0).toUpperCase() || '?'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {currentUser.name}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-coral-600 text-sm font-semibold hover:bg-cream-50 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Войти</span>
              </Link>
            )}
          </div>
        </div>

        {/* Secondary nav row — desktop */}
        {!isAuthPage && (
          <div className="hidden md:block border-t border-white/20">
            <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all relative',
                      isActive
                        ? 'bg-white text-coral-600'
                        : 'text-white/90 hover:bg-white/15',
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {to === '/chats' && totalUnread > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-coral-600 text-[10px] font-bold flex items-center justify-center">
                      {totalUnread}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Bottom nav (mobile only) */}
      {!isAuthPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors relative',
                    isActive ? 'text-coral-500' : 'text-slate-500',
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {to === '/chats' && totalUnread > 0 && (
                  <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-coral-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
