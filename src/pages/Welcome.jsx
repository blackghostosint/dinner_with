import { useRef, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Welcome() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const howItWorksRef = useRef(null);

  if (user) {
    navigate('/nearby', { replace: true });
    return null;
  }

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setFeedback('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    setLoading(true);
    if (password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setFeedback(error.message); return; }
      navigate('/nearby');
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email });
      setLoading(false);
      setFeedback(error ? error.message : 'Magic link queued. Check your inbox (and spam).');
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-8">
        <img
          src="/dinner_with_logo.png"
          alt="Dinner with..."
          className="h-64 w-auto"
        />
        <p className="text-lg text-slate-600">
          Turning strangers into neighbors, one dinner at a time. Host families invite guests from their community to a local restaurant — offering conversation, warmth, and a seat at the table.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/onboarding/role')}
            className="rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600"
          >
            Get started
          </button>
          <button
            onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400"
          >
            Scroll for details
          </button>
        </div>
        <form onSubmit={handleSignIn} className="space-y-3">
          <label className="text-xs uppercase tracking-[0.4em] text-slate-500">Sign in</label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            placeholder="you@dinnerwith.com"
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Password (or leave blank for magic link)"
            />
            <button
              type="submit"
              disabled={!email || loading}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Signing in...' : password ? 'Sign in' : 'Send magic link'}
            </button>
          </div>
          {feedback && <p className="text-xs text-slate-500">{feedback}</p>}
        </form>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Who it\'s for', value: 'Seniors, newcomers, anyone eating alone.' },
            { label: 'Radius', value: 'Within 10 miles' },
            { label: 'The host pays', value: 'The meal is on the host.' },
          ].map((tile) => (
            <div
              key={tile.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{tile.label}</p>
              <p className="mt-2 font-semibold text-slate-900">{tile.value}</p>
            </div>
          ))}
        </div>

        <div ref={howItWorksRef} className="space-y-6 border-t border-slate-200 pt-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500">How it works</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Four simple steps to a shared meal</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                step: '01',
                title: 'Create your profile',
                body: 'Sign up as a Host or Guest and share your location. Hosts are families or individuals who want to give back. Guests are anyone who would enjoy company at dinner.',
              },
              {
                step: '02',
                title: 'Discover people nearby',
                body: 'See members within 10 miles on a live map. Hosts see potential guests — seniors, newcomers, or anyone who would appreciate a shared meal.',
              },
              {
                step: '03',
                title: 'Send a dinner invite',
                body: 'Hosts choose a local sit-down restaurant and send an invite. The host covers the meal — the real gift is the conversation and connection.',
              },
              {
                step: '04',
                title: 'Share the table',
                body: 'Guests accept and both parties get the details. Show up, share a meal, and turn a stranger into a neighbor.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-bold text-amber-200">{item.step}</p>
                <p className="mt-2 font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 border border-amber-100">
            <p className="font-semibold">Not charity. Not dating. Just a shared table.</p>
            <p className="mt-1">Every night, millions of people eat alone — elderly, recently widowed, new to the city, or simply without company. Dinner with... gives everyone a seat at the table.</p>
          </div>
          <button
            onClick={() => navigate('/onboarding/role')}
            className="w-full rounded-2xl bg-amber-500 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 hover:bg-amber-600"
          >
            Get started
          </button>
        </div>
      </div>
    </Layout>
  );
}
