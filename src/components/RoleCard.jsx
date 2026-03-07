export default function RoleCard({ title, description, role, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(role)}
      className={`w-full rounded-2xl border-2 px-6 py-7 text-left transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-amber-500 bg-white shadow-lg shadow-amber-100'
          : 'border-amber-100 bg-white hover:border-amber-300'
      }`}
    >
      <div className="text-xs uppercase tracking-[0.4em] text-amber-500">{role}</div>
      <h3 className="mt-2 text-2xl text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      {selected && (
        <div className="mt-4 inline-block rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">Selected</div>
      )}
    </button>
  );
}
