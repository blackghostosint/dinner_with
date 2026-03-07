import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile, upsertProfile } from '../hooks/useProfile.js';

export default function ProfileEdit() {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);
  const [formValues, setFormValues] = useState({
    name: '',
    bio: '',
    phone: '',
    city: '',
    state: '',
  });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (profile) {
      setFormValues({
        name: profile.name ?? '',
        bio: profile.bio ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
      });
    }
  }, [profile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    try {
      await upsertProfile({
        id: user.id,
        email: user.email,
        ...formValues,
      });
      setFeedback('Profile updated.');
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
          <h1 className="text-3xl font-semibold text-slate-900">Edit your profile</h1>
        </header>
        <form className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          {['name', 'phone', 'city', 'state'].map((field) => (
            <label key={field} className="text-sm text-slate-500">
              {field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                value={formValues[field]}
                onChange={(event) => setFormValues((prev) => ({ ...prev, [field]: event.target.value }))}
                className="mt-2 block w-full rounded-2xl border border-amber-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </label>
          ))}
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
          {feedback && <p className="text-xs text-slate-500">{feedback}</p>}
        </form>
      </div>
      <BottomNav />
    </Layout>
  );
}
