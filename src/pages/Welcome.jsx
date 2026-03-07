import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        <p className="text-xs uppercase tracking-[0.4em] text-amber-500">V4 beta</p>
        <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
          Dinner with... brings sit-down dinners to neighbors who crave company.
        </h1>
        <p className="text-lg text-slate-600">
          This community-first experience is for hosts and guests who want to break
          bread, not break hearts. We surface nearby opposite-role members for
          platonic dinner matches.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/onboarding/role')}
            className="rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600"
          >
            Get started
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
            { label: 'Community focus', value: 'Safety-first, no dating.' },
            { label: 'Radius', value: '10 miles' },
            { label: 'Live map', value: 'Leaflet + OpenStreetMap' },
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
      </div>
    </Layout>
  );
}
