import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchedForRef = useRef(undefined);

  useEffect(() => {
    if (!userId || !supabase) {
      fetchedForRef.current = undefined;
      setProfile(null);
      setLoading(false);
      return;
    }

    let canceled = false;
    setLoading(true);

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (canceled) return;
        setProfile(data ?? null);
        setError(error ?? null);
        setLoading(false);
        fetchedForRef.current = userId;
      });

    return () => {
      canceled = true;
    };
  }, [userId]);

  const effectiveLoading = (userId != null && fetchedForRef.current !== userId) || loading;

  const hasCompletedProfile = useMemo(
    () => Boolean(profile?.profile_completed_at),
    [profile],
  );

  return { profile, loading: effectiveLoading, error, hasCompletedProfile };
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
