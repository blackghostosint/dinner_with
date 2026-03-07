export default function RoleCard({ title, description, role, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(role)}
      className={`w-full rounded-2xl border px-4 py-6 text-left transition ${
        selected ? 'border-amber-500 bg-white shadow-md' : 'border-slate-200 bg-white/70'
      }`}
    >
      <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{role}</div>
      <h3 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
    </button>
  );
}
