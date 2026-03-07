import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import MapView from '../components/MapView.jsx';
import UserCard from '../components/UserCard.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useNearby } from '../hooks/useNearby.js';
import { useProfile } from '../hooks/useProfile.js';

export default function Nearby() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const homeLocation = useMemo(() => {
    if (typeof profile?.lat === 'number' && typeof profile?.lng === 'number') {
      return { lat: profile.lat, lng: profile.lng };
    }
    return null;
  }, [profile?.lat, profile?.lng]);
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
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Step 3 / 3</p>
          <h1 className="text-3xl font-semibold text-slate-900">People nearby</h1>
          <p className="text-sm text-slate-500">
            {profile?.role === 'host'
              ? 'Choose a guest to invite.'
              : 'Accept a dinner invite from a host.'}
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          {['map', 'list'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] ${
                viewMode === mode
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-500'
              }`}
            >
              {mode === 'map' ? 'Map' : 'List'}
            </button>
          ))}
        </div>
        {nearbyLoading && <div className="text-sm text-slate-500">Scanning the radius...</div>}
        {!nearbyLoading && nearby.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
            No one nearby yet — invite your friends to join the community.
          </div>
        )}
        {viewMode === 'map' && (
          <MapView center={mapCenter} markers={nearby} />
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
