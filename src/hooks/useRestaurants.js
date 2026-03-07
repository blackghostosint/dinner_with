import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { haversineDistance } from '../lib/utils.js';

export function useRestaurants({ homeLocation } = {}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase
      .from('restaurants')
      .select('id, name, address, lat, lng, category')
      .eq('is_sit_down', true)
      .then(({ data, error }) => {
        if (!error && data) {
          const withDistance = data
            .map((r) => {
              const lat = parseFloat(r.lat);
              const lng = parseFloat(r.lng);
              if (isNaN(lat) || isNaN(lng)) return null;
              return {
                ...r, lat, lng,
                distance: homeLocation
                  ? haversineDistance(homeLocation.lat, homeLocation.lng, lat, lng)
                  : null,
              };
            })
            .filter(Boolean);
          setRestaurants(withDistance);
        }
        setLoading(false);
      });
  }, [homeLocation]);

  return { restaurants, loading };
}
