import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Phone, User } from 'lucide-react';

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone?: string | null;
  serviceName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const MiniMap = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:hsl(var(--primary));width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([latitude, longitude], { icon }).addTo(map);
    mapRef.current = map;

    // Fix map render in dialog
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  return <div ref={containerRef} className="w-full h-48 rounded-xl overflow-hidden" />;
};

const BookingDetailDialog = ({ open, onOpenChange, customerName, customerPhone, serviceName, latitude, longitude }: BookingDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{customerName}</span>
          </div>
          {customerPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customerPhone}</span>
            </div>
          )}
          {serviceName && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Service: {serviceName}</span>
            </div>
          )}
          {latitude && longitude ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Customer Location</p>
              <MiniMap latitude={latitude} longitude={longitude} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No location data available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailDialog;
