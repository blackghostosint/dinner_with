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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-slate-900">{restaurantName}</p>
          {restaurantAddress && (
            <p className="text-xs text-slate-400">{restaurantAddress}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[invite.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {invite.status}
        </span>
      </div>
      {otherPerson && (
        <p className="mt-2 text-sm text-slate-600">
          <span className="text-slate-400">{isHost ? 'Guest:' : 'Host:'}</span>{' '}
          <span className="font-medium">{otherPerson.name}</span>
          {otherPerson.city && <span className="text-slate-400"> · {otherPerson.city}, {otherPerson.state}</span>}
        </p>
      )}
      {invite.message && (
        <p className="mt-2 text-sm italic text-slate-500">"{invite.message}"</p>
      )}
      <p className="mt-3 text-xs uppercase tracking-[0.4em] text-slate-400">
        {invite.proposed_time ? new Date(invite.proposed_time).toLocaleString() : 'Time TBD'}
      </p>
    </div>
  );
}
