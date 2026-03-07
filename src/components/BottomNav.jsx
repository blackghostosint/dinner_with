import { CalendarClock, Home, LogOut, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const navItems = [
  { label: 'Nearby', icon: Home, href: '/nearby' },
  { label: 'Invites', icon: CalendarClock, href: '/invitations' },
  { label: 'Profile', icon: Users, href: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-3 rounded-3xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.href;
        return (
          <a
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center text-[11px] uppercase tracking-[0.3em] ${active ? 'text-amber-500' : 'text-slate-500'}`}
          >
            <Icon className={`h-5 w-5 ${active ? 'text-amber-500' : 'text-slate-500'}`} />
            {item.label}
          </a>
        );
      })}
      <button
        onClick={handleSignOut}
        className="flex flex-col items-center text-[11px] uppercase tracking-[0.3em] text-slate-400 hover:text-red-400"
      >
        <LogOut className="h-5 w-5" />
        Sign out
      </button>
    </nav>
  );
}
