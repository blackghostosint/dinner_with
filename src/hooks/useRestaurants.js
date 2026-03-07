import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { haversineDistance } from '../lib/utils.js';

const FSQ_URL = 'https://api.foursquare.com/v3/places/search';
const FSQ_RADIUS_METERS = 16093; // ~10 miles
const FSQ_CATEGORY = '13065'; // Restaurants
const FSQ_FIELDS = 'fsq_id,name,geocodes,location,categories,distance';

function normalizeSupabase(restaurants = [], homeLocation) {
  return restaurants
    .map((r) => {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lng);
      if (isNaN(lat) || isNaN(lng)) return null;
      const distance = homeLocation
        ? haversineDistance(homeLocation.lat, homeLocation.lng, lat, lng)
        : null;
      return { ...r, lat, lng, distance, source: 'seeded' };
    })
    .filter(Boolean);
}

function normalizeFoursquare(results = [], homeLocation) {
  return results
    .map((place) => {
      const lat = place.geocodes?.main?.latitude;
      const lng = place.geocodes?.main?.longitude;
      if (lat == null || lng == null) return null;
      const meters = place.distance ?? null;
      const miles = meters != null ? meters * 0.000621371 : null;
      return {
        id: place.fsq_id,
        name: place.name,
        address: place.location?.formatted_address ?? place.location?.address ?? '',
        category: place.categories?.[0]?.name ?? 'Restaurant',
        lat,
        lng,
        distance: miles ?? (homeLocation ? haversineDistance(homeLocation.lat, homeLocation.lng, lat, lng) : null),
        source: 'foursquare',
      };
    })
    .filter(Boolean);
}

function mergeLists(fsqList, seededList) {
  const seen = new Map();
  fsqList?.forEach((item) => {
    seen.set(item.id, item);
  });
  seededList?.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.set(item.id, item);
    }
  });
  return Array.from(seen.values());
}

export function useRestaurants({ homeLocation } = {}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});
  const fsqKey = import.meta.env.VITE_FSQ_API_KEY;
  const cacheKey = useMemo(() => {
    if (!homeLocation) return 'no-location';
    return `${homeLocation.lat.toFixed(4)},${homeLocation.lng.toFixed(4)}`;
  }, [homeLocation]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setRestaurants([]);
      return;
    }

    let canceled = false;
    setLoading(true);
    setError(null);

    const fetchSupabase = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, address, lat, lng, category')
        .eq('is_sit_down', true);
      if (error) throw error;
      return normalizeSupabase(data, homeLocation);
    };

    const fetchFoursquare = async () => {
      if (!fsqKey || !homeLocation) return [];
      if (cacheRef.current[cacheKey]) {
        return cacheRef.current[cacheKey];
      }
      const params = new URLSearchParams({
        ll: `${homeLocation.lat},${homeLocation.lng}`,
        radius: `${FSQ_RADIUS_METERS}`,
        categories: FSQ_CATEGORY,
        sort: 'DISTANCE',
        limit: '30',
        fields: FSQ_FIELDS,
      });
      const response = await fetch(`${FSQ_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${fsqKey}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Foursquare request failed');
      }
      const payload = await response.json();
      const normalized = normalizeFoursquare(payload.results, homeLocation);
      cacheRef.current[cacheKey] = normalized;
      return normalized;
    };

    Promise.allSettled([fetchSupabase(), fetchFoursquare()])
      .then(([supRes, fsqRes]) => {
        if (canceled) return;
        if (supRes.status === 'rejected') {
          setError(supRes.reason);
        }
        if (fsqRes.status === 'rejected') {
          setError(fsqRes.reason);
        }
        const seeded = supRes.status === 'fulfilled' ? supRes.value : [];
        const live = fsqRes.status === 'fulfilled' ? fsqRes.value : [];
        setRestaurants(mergeLists(live, seeded));
      })
      .catch((err) => {
        if (canceled) return;
        setError(err);
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [homeLocation, fsqKey, cacheKey]);

  return { restaurants, loading, error };
}
