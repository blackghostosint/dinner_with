export default function UserCard({ user = {}, distance, onView }) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
    : '??';

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl font-bold text-amber-800">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-900 truncate">{user.name ?? 'Someone kind'}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">{user.role ?? 'guest'}</p>
          <p className="text-xs text-slate-400">{user.city ?? '—'}, {user.state ?? '—'}</p>
        </div>
        {distance && <div className="text-right shrink-0"><p className="text-base font-semibold text-amber-500">{distance}</p><p className="text-xs text-slate-400">away</p></div>}
      </div>
      {user.bio && <p className="mt-3 text-sm leading-relaxed text-slate-500">{user.bio}</p>}
      <button
        onClick={onView}
        className="mt-4 min-h-[44px] w-full rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-amber-600 cursor-pointer"
      >
        View profile
      </button>
    </div>
  );
}
