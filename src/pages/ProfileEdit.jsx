import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile, upsertProfile } from '../hooks/useProfile.js';
import { detectLocation, normalizePhone } from '../lib/utils.js';

export default function ProfileEdit() {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);
  const [formValues, setFormValues] = useState({
    name: '',
    bio: '',
    phone: '',
    city: '',
    state: '',
    lat: null,
    lng: null,
  });
  const [feedback, setFeedback] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle');

  const handleLoc = () => {
    detectLocation(
      ({ lat, lng, city, state }) =>
        setFormValues((prev) => ({
          ...prev,
          lat,
          lng,
          city: city || prev.city,
          state: state || prev.state,
        })),
      setLocationStatus,
    );
  };

  useEffect(() => {
    if (profile) {
      setFormValues({
        name: profile.name ?? '',
        bio: profile.bio ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        lat: profile.lat ?? null,
        lng: profile.lng ?? null,
      });
    }
  }, [profile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    let { lat, lng } = formValues;
    // Auto-geocode city/state if coordinates are missing
    if ((!lat || !lng) && formValues.city && formValues.state) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(formValues.city)}&state=${encodeURIComponent(formValues.state)}&country=US&format=json&limit=1`,
          { headers: { 'User-Agent': 'DinnerWithApp/1.0' } },
        );
        const data = await res.json();
        if (data[0]) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      } catch { /* proceed without coords */ }
    }
    try {
      await upsertProfile({ id: user.id, email: user.email, ...formValues, lat, lng });
      setFeedback('Profile updated. Map will reflect your new location.');
    } catch (error) {
      setFeedback('Unable to update profile.');
    }
  };

  if (loading) {
    return (
      <Layout showTrust>
        <p className="text-sm text-slate-500">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout showTrust>
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Profile</p>
          <h1 className="text-slate-900">Edit your profile</h1>
        </header>
        <form className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          {['name', 'phone', 'city', 'state'].map((field) => (
            <label key={field} className="text-sm text-slate-500">
              {field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                value={formValues[field]}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [field]: field === 'phone' ? normalizePhone(event.target.value) : event.target.value,
                  }))
                }
                className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
          ))}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-500 mb-3">Location</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleLoc}
                className="min-h-[44px] rounded-2xl bg-amber-500 px-4 py-2 text-slate-900 font-semibold uppercase tracking-[0.4em] text-white hover:bg-amber-600 transition-all duration-200 cursor-pointer"
              >
                {locationStatus === 'pending' ? 'Detecting...' : 'Update location'}
              </button>
              <p aria-live="polite" aria-atomic="true" className="text-slate-500">
                {locationStatus === 'granted'
                  ? `Detected: ${formValues.city || 'City'}, ${formValues.state || 'State'}`
                  : locationStatus === 'denied'
                  ? 'Location denied — update city/state manually below.'
                  : formValues.lat
                  ? `Current: ${formValues.city}, ${formValues.state}`
                  : 'No location set — tap to detect.'}
              </p>
            </div>
          </div>

          <label className="text-sm text-slate-500">
            Bio
            <textarea
              maxLength={200}
              value={formValues.bio}
              onChange={(event) => setFormValues((prev) => ({ ...prev, bio: event.target.value }))}
              className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              rows={3}
            />
          </label>
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white hover:bg-amber-600 transition-all duration-200 cursor-pointer"
          >
            Save changes
          </button>
          {feedback && <p role="status" aria-live="polite" className="text-xs text-slate-500">{feedback}</p>}
        </form>
      </div>
      <BottomNav />
    </Layout>
  );
}
