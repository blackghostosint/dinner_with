import { useMemo, useState } from 'react';
import Layout from '../components/Layout.jsx';
import RoleCard from '../components/RoleCard.jsx';
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    role: 'host',
    title: 'I want to host',
    description: 'Invite someone from your community to a local restaurant. You cover the meal — the real gift is conversation and connection.',
  },
  {
    role: 'guest',
    title: 'I would enjoy company',
    description: 'Accept a dinner invitation from a host near you. No cost, no pressure — just a shared meal and good conversation.',
  },
];

export default function OnboardingRole() {
  const [selected, setSelected] = useState('host');
  const navigate = useNavigate();

  const current = useMemo(() => roles.find((entry) => entry.role === selected), [selected]);

  const handleContinue = () => {
    navigate(`/onboarding/signup?role=${selected}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Step 1 / 3</p>
          <h1 className="text-slate-900">Choose your role</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((item) => (
            <RoleCard
              key={item.role}
              {...item}
              selected={selected === item.role}
              onSelect={(role) => setSelected(role)}
            />
          ))}
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-slate-600 leading-relaxed">
            Hosts invite guests to a local restaurant and cover the meal. Guests are anyone who would enjoy company — seniors, newcomers, or simply someone who would rather not eat alone.
          </p>
          {current?.description && (
            <p className="mt-3 border-l-2 border-amber-300 pl-3 text-slate-500 italic leading-relaxed">
              {current.description}
            </p>
          )}
        </div>
        <button
          onClick={handleContinue}
          className="min-h-[44px] w-full rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition-all duration-200 hover:bg-amber-600 cursor-pointer"
        >
          Continue →
        </button>
      </div>
    </Layout>
  );
}
