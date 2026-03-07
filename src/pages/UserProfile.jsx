import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile } from '../hooks/useProfile.js';
import { haversineDistance, formatDistance } from '../lib/utils.js';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile(user?.id);
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const distance = useMemo(() => {
    const myLat = parseFloat(currentProfile?.lat);
    const myLng = parseFloat(currentProfile?.lng);
    const theirLat = parseFloat(person?.lat);
    const theirLng = parseFloat(person?.lng);
    if ([myLat, myLng, theirLat, theirLng].some(isNaN)) return null;
    return haversineDistance(myLat, myLng, theirLat, theirLng);
  }, [currentProfile, person]);

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
    if (!user) { setFeedback('Log in to report.'); return; }
    if (reportSent) return;
    const { error } = await supabase.from('safety_reports').insert({
      reporter_user_id: user.id,
      reported_user_id: person?.id,
      reason: 'Community guidelines violation',
    });
    if (!error) {
      setReportSent(true);
      setFeedback('Report submitted. Thank you for keeping the space safe.');
    }
  };

  if (loading) {
    return (
      <Layout showTrust>
        <p className="text-center text-slate-500">Loading profile…</p>
      </Layout>
    );
  }

  const initials = person?.name?.split(' ').map((p) => p[0]).join('').slice(0, 2) ?? '??';

  return (
    <Layout showTrust>
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
          className="min-h-[44px] text-xs uppercase tracking-[0.4em] text-slate-400 hover:text-amber-500 transition-colors duration-200 cursor-pointer"
        >
          ← Back
        </button>

        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-400 text-2xl font-bold text-amber-900">
              {initials}
            </div>
            <div className="flex-1">
              <p className="text-2xl font-semibold text-slate-900">{person?.name ?? 'Unnamed'}</p>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">{person?.role}</p>
              <p className="text-xs text-slate-400">{person?.city}, {person?.state}</p>
            </div>
            {distance !== null && (
              <div className="text-right">
                <p className="text-lg font-semibold text-amber-500">{formatDistance(distance)}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">away</p>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{person?.bio ?? 'No bio yet.'}</p>
        </div>

        {currentProfile?.role === 'host' && (
          <button
            onClick={handleInvite}
            className="min-h-[44px] w-full rounded-2xl bg-amber-500 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all duration-200 cursor-pointer"
          >
            Invite to dinner
          </button>
        )}

        <div className="rounded-3xl border border-amber-100 bg-amber-50/40 p-6">
          <p className="text-xs text-slate-400">
            {currentProfile?.role === 'host'
              ? "You'll pick a local restaurant on the next step. You cover the meal — the real gift is the conversation."
              : 'This host may invite you to a local restaurant. The host covers the meal — just show up and enjoy the company.'}
          </p>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <button
            onClick={handleReport}
            disabled={reportSent}
            className="min-h-[44px] rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-red-400 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
          >
            {reportSent ? 'Reported' : 'Report user'}
          </button>
          {feedback && <p role="status" aria-live="polite" className="mt-2 text-xs text-slate-500">{feedback}</p>}
        </div>
      </div>
    </Layout>
  );
}
