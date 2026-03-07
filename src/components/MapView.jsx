import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView({ center, markers = [] }) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <strong>{marker.name}</strong>
              <p className="text-xs">{marker.bio ?? marker.address}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
