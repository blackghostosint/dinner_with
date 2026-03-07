import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { upsertProfile } from '../hooks/useProfile.js';
import { detectLocation } from '../lib/utils.js';

export default function OnboardingProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [locationStatus, setLocationStatus] = useState('idle');
  const [formValues, setFormValues] = useState({
    name: '',
    bio: '',
    phone: '',
    city: '',
    state: '',
    lat: null,
    lng: null,
  });
  const role = searchParams.get('role') ?? 'guest';
  const locationText = useMemo(() => {
    if (formValues.city || formValues.state) {
      return `Detected: ${formValues.city || 'City'}, ${formValues.state || 'State'}`;
    }
    return 'Detecting...';
  }, [formValues.city, formValues.state]);

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
      await upsertProfile({
        id: user.id,
        email: user.email,
        name: formValues.name,
        bio: formValues.bio,
        phone: formValues.phone,
        city: formValues.city,
        state: formValues.state,
        lat,
        lng,
        role,
        profile_completed_at: new Date().toISOString(),
      });
      navigate('/nearby');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Step 3 / 3</p>
          <h1 className="text-slate-900">Tell us about yourself</h1>
          <p className="text-sm text-slate-500">
            Role: <span className="font-semibold">{role}</span>
          </p>
        </div>
        <form className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-500">
              Name
              <input
                required
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
            <label className="text-sm text-slate-500">
              Phone (optional)
              <input
                value={formValues.phone}
                onChange={(event) => setFormValues((prev) => ({ ...prev, phone: event.target.value }))}
                className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm text-slate-500">
            Bio
            <textarea
              maxLength={200}
              required
              value={formValues.bio}
              onChange={(event) => setFormValues((prev) => ({ ...prev, bio: event.target.value }))}
              className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              rows={4}
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleLoc}
              className="min-h-[44px] rounded-2xl bg-amber-500 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white hover:bg-amber-600 transition-all duration-200 cursor-pointer"
            >
              Allow location
            </button>
            <p className="text-xs text-slate-500 uppercase tracking-[0.4em]">
              {locationStatus === 'pending' ? 'Detecting...' : locationStatus === 'granted' ? locationText : 'Or enter city/state below'}
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-500">
              City
              <input
                value={formValues.city}
                onChange={(event) => setFormValues((prev) => ({ ...prev, city: event.target.value }))}
                className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
            <label className="text-sm text-slate-500">
              State
              <input
                value={formValues.state}
                onChange={(event) => setFormValues((prev) => ({ ...prev, state: event.target.value }))}
                className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 min-h-[44px] w-full rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-amber-200 transition-all duration-200 hover:bg-amber-600 cursor-pointer"
          >
            Save profile
          </button>
        </form>
      </div>
    </Layout>
  );
}
