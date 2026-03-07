import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile } from '../hooks/useProfile.js';
import { useRestaurants } from '../hooks/useRestaurants.js';
import { supabase } from '../lib/supabase.js';
import { formatDistance } from '../lib/utils.js';

export default function RestaurantPicker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const guestId = searchParams.get('guestId');

  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const homeLocation = useMemo(() => {
    const lat = parseFloat(profile?.lat);
    const lng = parseFloat(profile?.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    return null;
  }, [profile?.lat, profile?.lng]);

  const { restaurants, loading } = useRestaurants({ homeLocation });
  const sorted = useMemo(
    () => [...restaurants].sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999)),
    [restaurants],
  );

  const [guestName, setGuestName] = useState('');
  useEffect(() => {
    if (!guestId || !supabase) return;
    supabase.from('profiles').select('name').eq('id', guestId).single()
      .then(({ data }) => { if (data?.name) setGuestName(data.name); });
  }, [guestId]);

  return (
    <Layout showTrust>
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xs uppercase tracking-[0.4em] text-slate-400 hover:text-slate-600"
        >
          ← Back
        </button>
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Choose a restaurant</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {guestName ? `Dinner with ${guestName}` : 'Pick a restaurant'}
          </h1>
          <p className="text-sm text-slate-500">Sit-down restaurants sorted by distance</p>
        </header>

        {loading && <p className="text-sm text-slate-500">Loading restaurants…</p>}

        <div className="space-y-4">
          {sorted.map((restaurant) => (
            <div key={restaurant.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-slate-900">{restaurant.name}</p>
                  <p className="text-sm text-slate-500">{restaurant.category}</p>
                  <p className="text-xs text-slate-400">{restaurant.address}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {restaurant.distance !== null && (
                    <p className="text-sm font-semibold text-amber-500">{formatDistance(restaurant.distance)}</p>
                  )}
                  <button
                    onClick={() =>
                      navigate(`/invitations/create?guestId=${guestId ?? ''}&restaurantId=${restaurant.id}`)
                    }
                    className="rounded-2xl bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white hover:bg-amber-600"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
