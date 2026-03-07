import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../hooks/useAuth.js';

export default function CreateInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [consent, setConsent] = useState(true);
  const [feedback, setFeedback] = useState('');

  const guestId = searchParams.get('guestId');
  const restaurantId = searchParams.get('restaurantId');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user || !guestId || !restaurantId || !consent) {
      setFeedback('Fill everything and grant consent.');
      return;
    }
    const { error } = await supabase.from('invitations').insert({
      host_user_id: user.id,
      guest_user_id: guestId,
      restaurant_id: restaurantId,
      proposed_time: proposedTime || null,
      status: 'pending',
      message,
    });
    if (error) {
      setFeedback(error.message);
      return;
    }
    navigate('/invitations');
  };

  return (
    <Layout showTrust>
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">New invite</p>
          <h1 className="text-3xl font-semibold text-slate-900">Create a sit-down invite</h1>
        </header>
        <form className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <label className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Message (optional)
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              rows={4}
            />
          </label>
          <label className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Proposed date & time
            <input
              type="datetime-local"
              value={proposedTime}
              onChange={(event) => setProposedTime(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-500">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            I confirm thisDinner with... is for community connection only.
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200"
          >
            Send invite
          </button>
          {feedback && <p className="text-sm text-red-500">{feedback}</p>}
        </form>
      </div>
    </Layout>
  );
}
