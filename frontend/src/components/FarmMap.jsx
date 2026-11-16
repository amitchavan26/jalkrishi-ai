import "leaflet/dist/leaflet.css";
import React from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
  useMap,
} from "react-leaflet";

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FocusFlyTo({ focus }) {
  const map = useMap();
  const { lat, lon } = focus || {};
  const hasValidFocus =
    typeof lat === "number" &&
    !isNaN(lat) &&
    isFinite(lat) &&
    typeof lon === "number" &&
    !isNaN(lon) &&
    isFinite(lon);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (hasValidFocus) {
      map.flyTo([lat, lon], 12);
    }
  }, [lat, lon]);

  return null;
}

export default function FarmMap({ lat, lon, onPick, focus }) {
  const hasValidLatLon =
    typeof lat === "number" &&
    !isNaN(lat) &&
    isFinite(lat) &&
    typeof lon === "number" &&
    !isNaN(lon) &&
    isFinite(lon);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "320px", width: "100%" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {onPick && <LocationPicker onPick={onPick} />}
      {hasValidLatLon && <CircleMarker center={[lat, lon]} radius={8} />}
      {focus && <FocusFlyTo focus={focus} />}
    </MapContainer>
  );
}
