import { Star, MapPin } from 'lucide-react';
import { type ProviderWithDetails } from '@/types/provider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: ProviderWithDetails;
  onClick?: () => void;
}

const ProviderCard = ({ provider, onClick }: ProviderCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:shadow-md transition-all text-left min-h-[80px]"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
        {provider.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{provider.name}</h3>
          <div className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            provider.isOnline ? 'bg-[hsl(var(--success))]' : 'bg-muted-foreground/40'
          )} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
            <span className="text-xs font-medium">{provider.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({provider.reviewCount})</span>
          </div>
          <span className="text-muted-foreground text-xs">•</span>
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {provider.distance}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
          {provider.services.slice(0, 2).map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md font-normal">
              {s}
            </Badge>
          ))}
          {provider.hourlyRate > 0 && (
            <span className="text-xs font-semibold text-primary ml-auto whitespace-nowrap">₹{provider.hourlyRate}/hr</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ProviderCard;
