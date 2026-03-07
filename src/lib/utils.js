export function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 3959; // miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Normalizes a US phone number to XXX-XXX-XXXX format.
// Strips non-digits, limits to 10, formats as user types.
export function normalizePhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatDistance(mi) {
  if (mi === null || mi === undefined) return '—';
  return mi < 1 ? `${(mi * 5280).toFixed(0)} ft` : `${mi.toFixed(1)} mi`;
}

// Tries GPS first, falls back to IP geolocation if denied or unavailable.
// onResult({ lat, lng, city, state }) called on success.
// onStatus(status) called with 'pending' | 'granted' | 'failed'.
export async function detectLocation(onResult, onStatus) {
  onStatus('pending');

  const applyIpLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        onResult({ lat: data.latitude, lng: data.longitude, city: data.city ?? '', state: data.region ?? '' });
        onStatus('granted');
      } else {
        onStatus('failed');
      }
    } catch {
      onStatus('failed');
    }
  };

  if (!navigator.geolocation) {
    await applyIpLocation();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'User-Agent': 'DinnerWithApp/1.0' } },
        );
        const data = await res.json();
        onResult({
          lat: latitude,
          lng: longitude,
          city: data.address?.city ?? data.address?.town ?? '',
          state: data.address?.state ?? '',
        });
        onStatus('granted');
      } catch {
        onResult({ lat: latitude, lng: longitude, city: '', state: '' });
        onStatus('granted');
      }
    },
    applyIpLocation,
  );
}
