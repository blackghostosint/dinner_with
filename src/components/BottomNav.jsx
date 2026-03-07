import { CalendarClock, Compass, Home, Users } from 'lucide-react';

const navItems = [
  { label: 'Nearby', icon: Home, href: '/nearby' },
  { label: 'Map', icon: Compass, href: '/nearby' },
  { label: 'Invites', icon: CalendarClock, href: '/invitations' },
  { label: 'Profile', icon: Users, href: '/profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-3 rounded-3xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center text-[11px] uppercase tracking-[0.3em] text-slate-500"
          >
            <Icon className="h-5 w-5 text-slate-500" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
