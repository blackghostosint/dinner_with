export default function InviteCard({ invite, currentUserId }) {
  const statusStyles = {
    pending:   'bg-amber-100 text-amber-700',
    accepted:  'bg-emerald-100 text-emerald-700',
    declined:  'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  const isHost = invite.host_user_id === currentUserId;
  const otherPerson = isHost ? invite.guest : invite.host;
  const restaurantName = invite.restaurant?.name ?? 'Restaurant TBD';
  const restaurantAddress = invite.restaurant?.address ?? '';

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">{restaurantName}</p>
          {restaurantAddress && <p className="text-xs text-slate-400">{restaurantAddress}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[invite.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {invite.status}
        </span>
      </div>
      {otherPerson && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
            {otherPerson.name?.split(' ').map((p) => p[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{otherPerson.name}</p>
            {otherPerson.city && <p className="text-xs text-slate-400">{otherPerson.city}, {otherPerson.state}</p>}
          </div>
          <span className="ml-1 text-xs text-slate-400">{isHost ? '(guest)' : '(host)'}</span>
        </div>
      )}
      {invite.message && (
        <p className="mt-3 border-l-2 border-amber-200 pl-3 text-sm italic leading-relaxed text-slate-500">"{invite.message}"</p>
      )}
      <p className="mt-3 text-xs uppercase tracking-[0.4em] text-amber-500">
        {invite.proposed_time ? new Date(invite.proposed_time).toLocaleString() : 'Time TBD'}
      </p>
    </div>
  );
}
