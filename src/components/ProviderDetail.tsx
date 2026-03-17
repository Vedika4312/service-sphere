import { Star, MapPin, Clock, X } from 'lucide-react';
import { type ProviderWithDetails } from '@/types/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProviderDetailProps {
  provider: ProviderWithDetails;
  onClose: () => void;
  onBook: () => void;
}

const ProviderDetail = ({ provider, onClose, onBook }: ProviderDetailProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    if (!user) {
      toast.error('Please sign in to book');
      navigate('/auth');
      return;
    }
    setBooking(true);
    try {
      // Get customer location
      let customerLat: number | null = null;
      let customerLng: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        );
        customerLat = pos.coords.latitude;
        customerLng = pos.coords.longitude;
      } catch {
        // Location not available, proceed without it
      }

      const { error } = await supabase.from('bookings').insert({
        customer_id: user.id,
        provider_id: provider.id,
        customer_latitude: customerLat,
        customer_longitude: customerLng,
      });
      if (error) throw error;

      // Create or get conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('customer_id', user.id)
        .eq('provider_id', provider.id)
        .maybeSingle();
      if (!existing) {
        await supabase.from('conversations').insert({
          customer_id: user.id,
          provider_id: provider.id,
        });
      }

      toast.success('Booking request sent!');
      onBook();
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
            {provider.avatar}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{provider.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
              <span className="font-medium text-foreground">{provider.rating.toFixed(1)}</span>
              <span>({provider.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {provider.distance}
        </div>
        {provider.hourlyRate > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ₹{provider.hourlyRate}/hr
          </div>
        )}
        <Badge variant={provider.isOnline ? 'default' : 'secondary'} className="text-xs">
          {provider.isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {provider.services.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Services</h3>
          <div className="flex flex-wrap gap-2">
            {provider.services.map((s) => (
              <Badge key={s} variant="secondary" className="rounded-lg px-3 py-1">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleBook} size="lg" className="w-full rounded-xl h-12 text-base font-semibold" disabled={booking}>
        {booking && <Loader2 className="h-4 w-4 animate-spin" />}
        Book Now
      </Button>
    </div>
  );
};

export default ProviderDetail;
