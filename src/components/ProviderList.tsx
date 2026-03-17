import { type MockProvider } from '@/data/mockProviders';
import ProviderCard from './ProviderCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProviderListProps {
  providers: MockProvider[];
  loading?: boolean;
  onProviderClick?: (provider: MockProvider) => void;
}

const ProviderListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-border">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    ))}
  </div>
);

const ProviderList = ({ providers, loading, onProviderClick }: ProviderListProps) => {
  if (loading) return <ProviderListSkeleton />;

  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">No providers found</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Try a different category or search</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} onClick={() => onProviderClick?.(provider)} />
      ))}
    </div>
  );
};

export default ProviderList;
