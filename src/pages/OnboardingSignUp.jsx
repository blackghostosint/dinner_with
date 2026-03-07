import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../hooks/useAuth.js';

export default function OnboardingSignUp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') ?? 'guest';
  const { user } = useAuth();

  // Already logged in — skip account creation
  if (user) {
    navigate(`/onboarding/profile?role=${role}`, { replace: true });
    return null;
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setFeedback('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setFeedback(error.message);
      return;
    }
    navigate(`/onboarding/profile?role=${role}`);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Step 2 / 3</p>
          <h1 className="text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-500">
            Joining as a <span className="font-semibold text-slate-700">{role}</span>. Your details are only shared with people you connect with.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-amber-100 bg-white p-8 shadow-sm"
        >
          <label className="block text-slate-500">
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block w-full rounded-2xl border border-amber-100 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="your@email.com"
            />
          </label>

          <label className="block text-slate-500">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-2xl border border-amber-100 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="At least 6 characters"
            />
          </label>

          {feedback && (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-600">
              {feedback}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[52px] w-full rounded-2xl bg-amber-500 px-6 py-3 font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition-all duration-200 hover:bg-amber-600 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>

          <p className="text-center text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-amber-500 underline underline-offset-2 hover:text-amber-600 cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </Layout>
  );
}
