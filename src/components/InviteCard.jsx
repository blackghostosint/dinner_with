import { formatDistance } from '../lib/utils.js';

export default function InviteCard({ invite }) {
  const statusStyles = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    declined: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-slate-900">{invite.restaurant_name ?? 'Restaurant'}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[invite.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {invite.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {invite.message ?? 'Someone is hoping to share a meal.'}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.4em] text-slate-400">
        {invite.proposed_time ? new Date(invite.proposed_time).toLocaleString() : 'No time yet'}
      </p>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
        <span>{invite.place ?? 'Sit-down restaurant'}</span>
        <span>{formatDistance(invite.distance)}</span>
      </div>
    </div>
  );
}
