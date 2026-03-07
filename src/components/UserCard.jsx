export default function UserCard({ user = {}, distance, onView }) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
    : '??';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-lg font-semibold text-amber-800">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">{user.name ?? 'Someone kind'}</p>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            {user.role ?? 'guest'}
          </p>
        </div>
        <div className="ml-auto text-right text-sm text-slate-500">{distance}</div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{user.bio ?? 'Bio coming soon.'}</p>
      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>{user.city ?? '—'}, {user.state ?? '—'}</span>
      </div>
      <button
        onClick={onView}
        className="mt-4 inline-flex items-center justify-center rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
      >
        View profile
      </button>
    </div>
  );
}
