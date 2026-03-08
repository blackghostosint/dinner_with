import { useRef, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Welcome() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const howItWorksRef = useRef(null);

  useDocumentTitle('Welcome');

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
      <div className="mx-auto max-w-3xl">

        {/* Hero */}
        <div className="py-12 space-y-8">
          <img src="/dinner_with_logo.png" alt="Dinner with..." className="h-64 w-auto" />
          <p className="text-xl leading-relaxed text-slate-600 max-w-xl">
            Turning strangers into neighbors, one dinner at a time. Host families invite guests from their community to a local restaurant — offering conversation, warmth, and a seat at the table.
          </p>

          {/* Sign in */}
          <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-8 shadow-lg shadow-amber-100 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500 mb-2">Already a member?</p>
            <h2 className="text-slate-900 mb-6">Sign in to your account</h2>
            <form onSubmit={handleSignIn} className="space-y-3 text-left" aria-label="Sign in form">
              <label htmlFor="signin-email" className="sr-only">Email address</label>
              <input
                id="signin-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-3 text-base focus:outline-none focus:border-amber-400 transition-colors duration-200"
                placeholder="your@email.com"
                autoComplete="email"
              />
              <div className="flex flex-wrap gap-2">
                <label htmlFor="signin-password" className="sr-only">Password (leave blank to receive a magic link)</label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="flex-1 rounded-2xl border-2 border-amber-200 bg-white px-4 py-3 text-base focus:outline-none focus:border-amber-400 transition-colors duration-200"
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="submit"
                  disabled={!email || loading}
                  aria-busy={loading}
                  className="min-h-[52px] rounded-2xl bg-amber-500 px-8 py-3 font-semibold text-white shadow-md shadow-amber-200 transition-all duration-200 disabled:opacity-40 hover:bg-amber-600 cursor-pointer"
                >
                  {loading ? 'Signing in...' : password ? 'Sign in' : 'Send link'}
                </button>
              </div>
              {feedback && <p role="status" aria-live="polite" className="mt-1 text-slate-500">{feedback}</p>}
            </form>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/onboarding/role')}
              className="min-h-[44px] rounded-2xl bg-amber-500 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition-all duration-200 hover:bg-amber-600 hover:shadow-amber-300 cursor-pointer"
            >
              Get started
            </button>
            <button
              onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="min-h-[44px] rounded-2xl border-2 border-slate-200 bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition-all duration-200 hover:border-amber-300 hover:text-amber-600 cursor-pointer"
            >
              How it works
            </button>
          </div>
        </div>

        {/* Stat tiles */}
        <ul className="grid gap-3 sm:grid-cols-3 pb-12 border-b border-amber-100 list-none p-0">
          {[
            { label: "Who it's for", value: 'Seniors, newcomers, anyone eating alone.' },
            { label: 'Radius', value: 'Within 10 miles' },
            { label: 'The host pays', value: 'The meal is on the host.' },
          ].map((tile) => (
            <li key={tile.label} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-500">{tile.label}</p>
              <p className="mt-2 text-base font-semibold text-slate-900 leading-snug">{tile.value}</p>
            </li>
          ))}
        </ul>

        {/* How it works */}
        <div ref={howItWorksRef} className="py-12 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500">How it works</p>
            <h2 className="mt-2 text-3xl text-slate-900">Four steps to a shared meal</h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 list-none p-0">
            {[
              { step: '01', title: 'Create your profile', body: 'Sign up as a Host or Guest and share your location. Hosts give back. Guests enjoy company.' },
              { step: '02', title: 'Discover people nearby', body: 'See members within 10 miles on a live map — seniors, newcomers, or anyone who would appreciate a shared meal.' },
              { step: '03', title: 'Send a dinner invite', body: 'Hosts choose a local sit-down restaurant and send an invite. The host covers the meal.' },
              { step: '04', title: 'Share the table', body: 'Guests accept and both parties get the details. Show up, share a meal, turn a stranger into a neighbor.' },
            ].map((item) => (
              <li key={item.step} className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
                <p aria-hidden="true" className="font-display text-4xl font-bold text-amber-200">{item.step}</p>
                <p className="mt-3 text-base font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl bg-amber-500 p-6 text-white">
            <p className="text-lg font-semibold">Not charity. Not dating. Just a shared table.</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-50">Every night, millions of people eat alone — elderly, recently widowed, new to the city, or simply without company. Dinner with... gives everyone a seat at the table.</p>
          </div>

          <button
            onClick={() => navigate('/onboarding/role')}
            className="w-full min-h-[52px] rounded-2xl bg-amber-500 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition-all duration-200 hover:bg-amber-600 cursor-pointer"
          >
            Get started — it's free
          </button>
        </div>

      </div>
    </Layout>
  );
}
