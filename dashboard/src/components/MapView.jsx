import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import StatusTag from './StatusTag';
import { categoriesConfig } from '../data/mockData';
import { ExternalLink, MapPin } from 'lucide-react';

// Create custom colored markers using L.divIcon
const createCustomIcon = (priorityScore) => {
  let color = '#10b981'; // Green (Low)
  let shadowColor = 'rgba(16, 185, 129, 0.4)';

  if (priorityScore >= 75) {
    color = '#ef4444'; // Red (Urgent)
    shadowColor = 'rgba(239, 68, 68, 0.6)';
  } else if (priorityScore >= 50) {
    color = '#f97316'; // Orange (High)
    shadowColor = 'rgba(249, 115, 22, 0.5)';
  } else if (priorityScore >= 25) {
    color = '#eab308'; // Yellow (Medium)
    shadowColor = 'rgba(234, 179, 8, 0.4)';
  }

  const html = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: ${color};
        opacity: 0.3;
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 2.5px solid #0f172a;
        box-shadow: 0 4px 12px ${shadowColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 10px;
        font-family: monospace;
      ">
        ${priorityScore}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapView({ complaints = [], height = '500px', selectedId = null }) {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState([25.5941, 85.1376]); // Default Patna

  useEffect(() => {
    const fetchCityCoords = async () => {
      const city = localStorage.getItem('swachhlens_city');
      const district = localStorage.getItem('swachhlens_district');
      const state = localStorage.getItem('swachhlens_state');
      
      const query = city && city !== 'null' ? `${city}, ${state || 'India'}` 
                  : district && district !== 'null' ? `${district}, ${state || 'India'}`
                  : state && state !== 'null' ? `${state}, India`
                  : null;

      if (query) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data && data.length > 0) {
            setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            return; // Successfully got coords
          }
        } catch (e) {
          console.error("Failed to fetch map coordinates for jurisdiction", e);
        }
      }

      // Fallback to first complaint if geocoding fails or no jurisdiction is set
      if (complaints.length > 0) {
        setMapCenter([complaints[0].gps.lat, complaints[0].gps.lng]);
      }
    };

    fetchCityCoords();
  }, [complaints]);

  // Memoize marker icons and add jitter to overlapping coordinates
  const markers = useMemo(() => {
    const seen = new Set();
    return complaints.map((c) => {
      let lat = parseFloat(c.gps?.lat || 0);
      let lng = parseFloat(c.gps?.lng || 0);
      const coordStr = `${lat},${lng}`;
      if (seen.has(coordStr)) {
        // Add tiny random jitter to prevent perfect overlap (~10 meters)
        lat += (Math.random() - 0.5) * 0.0002;
        lng += (Math.random() - 0.5) * 0.0002;
      }
      seen.add(coordStr);
      
      return {
        ...c,
        jitteredGps: { lat, lng },
        icon: createCustomIcon(c.priority_score)
      };
    });
  }, [complaints]);

  return (
    <div style={{ height }} className="w-full relative rounded-xl overflow-hidden border border-slate-700/80 shadow-xl">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapUpdater center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {markers.map((c) => (
          <Marker key={c.id} position={[c.jitteredGps.lat, c.jitteredGps.lng]} icon={c.icon}>
            <Popup className="swachh-popup">
              <div className="w-64 p-3 bg-slate-900 text-slate-100 rounded-lg space-y-2.5">
                <div className="relative h-28 w-full rounded-md overflow-hidden bg-slate-800">
                  <img
                    src={c.image_url || 'https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image'}
                    alt={c.category}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <PriorityBadge score={c.priority_score} size="small" />
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <StatusTag status={c.status} size="small" />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-teal-400 font-mono tracking-wider">
                    {c.id}
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">
                    {categoriesConfig[c.category]?.label || c.category}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400 font-medium capitalize">
                    Vol: <strong className="text-slate-200">{c.volume.replace('_', ' ')}</strong>
                  </span>
                  <button
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 shadow-lg text-xs space-y-1">
        <div className="font-semibold text-slate-300 mb-1 text-[11px] uppercase tracking-wider">Priority Legend</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>Urgent (75 - 100)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>High (50 - 74)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>Medium (25 - 49)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Low (0 - 24)</span>
        </div>
      </div>
    </div>
  );
}
