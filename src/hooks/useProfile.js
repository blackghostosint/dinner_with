import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !supabase) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        setProfile(data ?? null);
        setError(error ?? null);
        setLoading(false);
      });
  }, [userId]);

  const hasCompletedProfile = useMemo(
    () => profile !== null && (Boolean(profile?.profile_completed_at) || Boolean(profile?.name)),
    [profile],
  );

  return { profile, loading, error, hasCompletedProfile };
}

export async function upsertProfile(payload) {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  const { error } = await supabase.from('profiles').upsert(payload);
  if (error) {
    throw error;
  }
  return payload;
}
