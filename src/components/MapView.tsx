import { useEffect, useRef } from 'react';
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

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MapView;
