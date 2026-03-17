import { useState, useMemo, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import MapView from '@/components/MapView';
import ProviderList from '@/components/ProviderList';
import ProviderDetail from '@/components/ProviderDetail';
import MobileDrawer from '@/components/MobileDrawer';
import PageTransition from '@/components/PageTransition';
import { mockProviders, type ServiceCategory, type MockProvider } from '@/data/mockProviders';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const Explore = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MockProvider | null>(null);

  const filteredProviders = useMemo(() => {
    return mockProviders.filter((p) => {
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [search, selectedCategory]);

  const handleBook = useCallback(() => {
    toast.success('Booking request sent! (Demo)');
    setSelectedProvider(null);
  }, []);

  const handleProviderClick = useCallback((provider: MockProvider) => {
    setSelectedProvider(provider);
  }, []);

  return (
    <PageTransition>
      <div className="h-[100dvh] flex flex-col">
        {/* Search header */}
        <div className="flex-shrink-0 px-4 pt-3 pb-2 space-y-2 bg-background/80 backdrop-blur-xl z-10">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Main content */}
        {isMobile ? (
          /* Mobile: full map + bottom drawer */
          <div className="flex-1 relative">
            <MapView
              providers={filteredProviders}
              onMarkerClick={handleProviderClick}
              selectedId={selectedProvider?.id}
            />
            <MobileDrawer>
              <div className="pt-2">
                <h2 className="font-semibold text-sm text-muted-foreground mb-3">
                  {filteredProviders.length} providers nearby
                </h2>
                <ProviderList providers={filteredProviders} onProviderClick={handleProviderClick} />
              </div>
            </MobileDrawer>
          </div>
        ) : (
          /* Desktop: split screen */
          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 border-r border-border overflow-y-auto px-4 py-3 pb-20">
              <h2 className="font-semibold text-sm text-muted-foreground mb-3">
                {filteredProviders.length} providers nearby
              </h2>
              <ProviderList providers={filteredProviders} onProviderClick={handleProviderClick} />
            </div>
            <div className="w-1/2">
              <MapView
                providers={filteredProviders}
                onMarkerClick={handleProviderClick}
                selectedId={selectedProvider?.id}
              />
            </div>
          </div>
        )}

        {/* Provider detail modal */}
        <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
          <DialogContent className="sm:max-w-md p-0 rounded-2xl overflow-hidden">
            {selectedProvider && (
              <ProviderDetail
                provider={selectedProvider}
                onClose={() => setSelectedProvider(null)}
                onBook={handleBook}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Explore;
