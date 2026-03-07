import { CalendarClock, Home, LogOut, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const navItems = [
  { label: 'Nearby', icon: Home, href: '/nearby' },
  { label: 'Invites', icon: CalendarClock, href: '/invitations' },
  { label: 'Profile', icon: Users, href: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav aria-label="Main navigation" className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-1 rounded-3xl border border-amber-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.href}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center px-3 text-[10px] uppercase tracking-[0.3em] transition-colors duration-150 cursor-pointer ${
                isActive ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5 text-current" aria-hidden="true" />
                <span>{item.label}</span>
                {isActive && <span className="sr-only">(current page)</span>}
              </>
            )}
          </NavLink>
        );
      })}
      <button
        onClick={handleSignOut}
        aria-label="Sign out of your account"
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center px-3 text-[10px] uppercase tracking-[0.3em] text-slate-400 transition-colors duration-150 hover:text-red-400 cursor-pointer"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Sign out
      </button>
    </nav>
  );
}
