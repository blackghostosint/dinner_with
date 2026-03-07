import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const personIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#F59E0B;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const placeIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#10B981;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const selfIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:#3B82F6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.35),0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

function iconForType(type) {
  if (type === 'self') return selfIcon;
  if (type === 'place') return placeIcon;
  return personIcon;
}

export default function MapView({ center, markers = [], selfMarker = null }) {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={center ?? [37.7749, -122.4194]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {selfMarker && (
          <Marker position={[selfMarker.lat, selfMarker.lng]} icon={selfIcon} zIndexOffset={1000}>
            <Popup><strong>You</strong></Popup>
          </Marker>
        )}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={iconForType(marker.type)}
          >
            <Popup>
              <strong>{marker.name}</strong>
              <p style={{fontSize:'12px',margin:'4px 0 0'}}>{marker.bio ?? marker.address}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
