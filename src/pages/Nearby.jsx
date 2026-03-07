import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import MapView from '../components/MapView.jsx';
import UserCard from '../components/UserCard.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useNearby } from '../hooks/useNearby.js';
import { useProfile } from '../hooks/useProfile.js';
import { useRestaurants } from '../hooks/useRestaurants.js';

export default function Nearby() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const homeLocation = useMemo(() => {
    const lat = parseFloat(profile?.lat);
    const lng = parseFloat(profile?.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    return null;
  }, [profile?.lat, profile?.lng]);
  const { restaurants } = useRestaurants({ homeLocation });
  const { nearby, loading: nearbyLoading } = useNearby({
    role: profile?.role,
    homeLocation,
    currentUserId: user?.id,
  });
  const [viewMode, setViewMode] = useState('map');
  const navigate = useNavigate();

  const mapCenter = useMemo(() => {
    if (homeLocation) {
      return [homeLocation.lat, homeLocation.lng];
    }
    return [37.7749, -122.4194];
  }, [homeLocation]);

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <p className="text-center text-slate-500">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout showTrust>
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Discover</p>
          <h1 className="text-3xl text-slate-900">People nearby</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {profile?.role === 'host'
              ? 'Choose someone from your community to invite to dinner.'
              : 'A host near you will cover the meal — just bring yourself.'}
          </p>
        </header>
        <div className="flex gap-2">
          {['map', 'list'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`min-h-[44px] rounded-2xl px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 cursor-pointer ${
                viewMode === mode
                  ? 'bg-slate-900 text-white'
                  : 'border-2 border-amber-100 text-slate-500 hover:border-amber-300'
              }`}
            >
              {mode === 'map' ? 'Map' : 'List'}
            </button>
          ))}
        </div>
        {nearbyLoading && <div className="text-sm text-slate-500">Scanning the radius...</div>}
        {!nearbyLoading && nearby.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-amber-100 bg-white p-8 text-center">
            <p className="text-base font-semibold text-slate-700">No one nearby yet</p>
            <p className="mt-1 text-sm text-slate-400">Invite your friends to join the community.</p>
          </div>
        )}
        {viewMode === 'map' && (
          <MapView
            center={mapCenter}
            markers={[
              ...nearby.map((p) => ({ ...p, type: 'person' })),
              ...restaurants.map((r) => ({ ...r, type: 'place' })),
            ]}
            selfMarker={homeLocation}
          />
        )}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {nearby.map((person) => (
            <UserCard
              key={person.id}
              user={person}
              distance={person.distance ? `${person.distance.toFixed(1)} mi` : '—'}
              onView={() => navigate(`/users/${person.id}`)}
            />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </Layout>
  );
}
