import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@shared/schema";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface UKMotorwayMapProps {
  locations: Location[];
}

const postcodeToCoords: Record<string, [number, number]> = {
  "CH2 4QZ": [53.2026, -2.8958],
  "ST15 0EU": [52.8167, -2.1167],
  "SO16 8AP": [50.9520, -1.4436],
  "WR8 0BZ": [52.0617, -2.1383],
  "DE55 5TZ": [53.1167, -1.3167],
  "TA3 7PF": [50.9833, -3.1000],
  "WS11 1SB": [52.6833, -2.0167],
};

export default function UKMotorwayMap({ locations }: UKMotorwayMapProps) {
  useEffect(() => {
    const mapElements = document.querySelectorAll(".leaflet-container");
    mapElements.forEach((el) => {
      const container = el as any;
      if (container._leaflet_id) {
        const map = container._leaflet_map;
        if (map) {
          setTimeout(() => map.invalidateSize(), 100);
        }
      }
    });
  }, []);

  const ukCenter: [number, number] = [52.5, -1.5];

  const createNumberedIcon = (number: number) => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background: hsl(var(--primary));
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${number}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  return (
    <div className="h-full w-full rounded-md overflow-hidden border">
      <MapContainer
        center={ukCenter}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        data-testid="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => {
          const coords = postcodeToCoords[location.postcode];
          if (!coords) return null;

          return (
            <Marker
              key={location.locationId}
              position={coords}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{location.name}</strong>
                  <br />
                  {location.motorway} - {location.area}
                  <br />
                  <span className="text-muted-foreground">{location.postcode}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
