import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { haversineDistance } from '../lib/utils.js';

const MAX_DISTANCE_MILES = 10;

export function useNearby({ role, homeLocation, currentUserId }) {
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!role || !homeLocation || !supabase) {
      setNearby([]);
      setLoading(false);
      return;
    }

    const targetRole = role === 'host' ? 'guest' : 'host';
    setLoading(true);

    supabase
      .from('profiles')
      .select('*')
      .eq('role', targetRole)
      .not('id', 'eq', currentUserId)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError);
          setNearby([]);
        } else {
          const withDistance = (data ?? [])
            .map((profile) => {
              if (
                typeof profile.lat !== 'number' ||
                typeof profile.lng !== 'number'
              ) {
                return null;
              }
              const miles = haversineDistance(
                homeLocation.lat,
                homeLocation.lng,
                profile.lat,
                profile.lng,
              );
              return { ...profile, distance: miles };
            })
            .filter(Boolean)
            .filter((profile) => profile.distance <= MAX_DISTANCE_MILES)
            .sort((a, b) => a.distance - b.distance);
          setNearby(withDistance);
        }
        setLoading(false);
      });
  }, [role, homeLocation, currentUserId]);

  const hasNearby = useMemo(() => nearby.length > 0, [nearby]);

  return { nearby, loading, error, hasNearby };
}
