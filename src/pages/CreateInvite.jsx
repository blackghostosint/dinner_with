import { useEffect, useState } from 'react';
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
  const [guestName, setGuestName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');

  const guestId = searchParams.get('guestId');
  const restaurantId = searchParams.get('restaurantId');

  useEffect(() => {
    if (!supabase) return;
    if (guestId) {
      supabase.from('profiles').select('name').eq('id', guestId).single()
        .then(({ data }) => { if (data?.name) setGuestName(data.name); });
    }
    if (restaurantId) {
      supabase.from('restaurants').select('name').eq('id', restaurantId).single()
        .then(({ data }) => { if (data?.name) setRestaurantName(data.name); });
    }
  }, [guestId, restaurantId]);

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
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
          className="min-h-[44px] text-xs uppercase tracking-[0.4em] text-slate-400 hover:text-amber-500 transition-colors duration-200 cursor-pointer"
        >
          ← Back
        </button>
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">New invite</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {guestName ? `Invite ${guestName}` : 'Create a sit-down invite'}
          </h1>
          {restaurantName && (
            <p className="mt-1 text-sm text-slate-500">at <span className="font-medium text-slate-700">{restaurantName}</span></p>
          )}
        </header>
        <form className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <label className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Message (optional)
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              rows={4}
            />
          </label>
          <label className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Proposed date & time
            <input
              type="datetime-local"
              value={proposedTime}
              onChange={(event) => setProposedTime(event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-500">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            I confirm this Dinner with... invite is for community connection only.
          </label>
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition-all duration-200 hover:bg-amber-600 cursor-pointer"
          >
            Send invite
          </button>
          {feedback && <p role="alert" aria-live="assertive" className="text-sm text-red-500">{feedback}</p>}
        </form>
      </div>
    </Layout>
  );
}
