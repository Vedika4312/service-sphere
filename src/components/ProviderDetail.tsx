import { Star, MapPin, Clock, X } from 'lucide-react';
import { type MockProvider } from '@/data/mockProviders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProviderDetailProps {
  provider: MockProvider;
  onClose: () => void;
  onBook: () => void;
}

const ProviderDetail = ({ provider, onClose, onBook }: ProviderDetailProps) => {
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
              <span className="font-medium text-foreground">{provider.rating}</span>
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
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          ₹{provider.hourlyRate}/hr
        </div>
        <Badge variant={provider.isOnline ? 'default' : 'secondary'} className="text-xs">
          {provider.isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

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

      <Button onClick={onBook} size="lg" className="w-full rounded-xl h-12 text-base font-semibold">
        Book Now
      </Button>
    </div>
  );
};

export default ProviderDetail;
