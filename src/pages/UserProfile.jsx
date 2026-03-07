import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile } from '../hooks/useProfile.js';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile(user?.id);
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        setPerson(data ?? null);
        setLoading(false);
      });
  }, [id]);

  const handleInvite = () => {
    navigate(`/restaurants/pick?guestId=${person?.id}`);
  };

  const handleReport = async () => {
    if (!user) {
      setFeedback('Log in to report.');
      return;
    }
    await supabase.from('safety_reports').insert({
      reporter_user_id: user.id,
      reported_user_id: person?.id,
      reason: 'Community guidelines violation',
    });
    setFeedback('Report submitted. Thank you for keeping the space safe.');
  };

  if (loading) {
    return (
      <Layout showTrust>
        <p className="text-center text-slate-500">Loading profile…</p>
      </Layout>
    );
  }

  return (
    <Layout showTrust>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-400 p-3 text-3xl font-semibold text-amber-900">
              {person?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) ?? '??'}
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{person?.name ?? 'Unnamed'}</p>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">{person?.role}</p>
              <p className="text-xs text-slate-400">{person?.city}, {person?.state}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">{person?.bio ?? 'No bio yet.'}</p>
        </div>
        <div className="space-y-3 rounded-3xl border border-amber-100 bg-amber-50/60 p-6 text-sm text-slate-600">
          <p className="font-semibold text-amber-700">Invite context</p>
          <p>
            {currentProfile?.role === 'host'
              ? 'Select a restaurant to invite this guest to dinner.'
              : 'Ask a host to invite you to a sit-down meal.'}
          </p>
          {currentProfile?.role === 'host' && (
            <button
              onClick={handleInvite}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white"
            >
              Invite to dinner
            </button>
          )}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <button
            onClick={handleReport}
            className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-red-600"
          >
            Report user
          </button>
          {feedback && <p className="mt-2 text-xs text-slate-500">{feedback}</p>}
        </div>
      </div>
    </Layout>
  );
}
