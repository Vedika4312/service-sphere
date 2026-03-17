import { CalendarDays } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const Bookings = () => {
  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20">
        <div className="px-4 pt-6">
          <h1 className="text-xl font-bold">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Your upcoming and past bookings</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-lg">No bookings yet</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Book a service provider from the Explore tab to see your bookings here.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Bookings;
