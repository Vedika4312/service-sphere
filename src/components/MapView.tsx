import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type ProviderWithDetails, type ServiceCategory } from '@/types/provider';


const categoryColors: Record<ServiceCategory, string> = {
  plumber: '#3b82f6',
  cook: '#f97316',
  drycleaner: '#8b5cf6',
  electrician: '#eab308',
};

const categoryIcons: Record<ServiceCategory, string> = {
  plumber: '🔧',
  cook: '👨‍🍳',
  drycleaner: '👔',
  electrician: '⚡',
};

function createMarkerIcon(category: ServiceCategory) {
  const color = categoryColors[category];
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white;">${categoryIcons[category]}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface MapViewProps {
  providers: ProviderWithDetails[];
  onMarkerClick?: (provider: ProviderWithDetails) => void;
  selectedId?: string | null;
}

const MapView = ({ providers, onMarkerClick, selectedId }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    providers.forEach((provider) => {
      const marker = L.marker([provider.latitude, provider.longitude], {
        icon: createMarkerIcon(provider.category),
      })
        .addTo(mapRef.current!)
        .on('click', () => onMarkerClick?.(provider));

      marker.bindTooltip(provider.name, { direction: 'top', offset: [0, -20] });
      markersRef.current.push(marker);
    });
  }, [providers, onMarkerClick]);

  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const provider = providers.find((p) => p.id === selectedId);
    if (provider) {
      mapRef.current.flyTo([provider.latitude, provider.longitude], 16, { duration: 0.5 });
    }
  }, [selectedId, providers]);

  // Add locate button as a Leaflet control inside the map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const LocateControl = L.Control.extend({
      onAdd: function () {
        const btn = L.DomUtil.create('button', '');
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
        btn.title = 'My Location';
        btn.style.cssText = 'width:34px;height:34px;background:white;border:2px solid rgba(0,0,0,0.2);border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;';
        L.DomEvent.disableClickPropagation(btn);
        btn.addEventListener('click', () => handleLocateMe());
        return btn;
      },
    });

    const control = new LocateControl({ position: 'bottomright' });
    control.addTo(map);

    return () => { map.removeControl(control); };
  }, []);

  const handleLocateMe = () => {
    if (!mapRef.current || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (userMarkerRef.current) userMarkerRef.current.remove();

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:20px;height:20px;border-radius:50%;background:hsl(217,91%,60%);border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([latitude, longitude], { icon })
          .addTo(mapRef.current!)
          .bindTooltip('You are here', { direction: 'top', offset: [0, -12] });

        mapRef.current!.flyTo([latitude, longitude], 15, { duration: 0.8 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MapView;
