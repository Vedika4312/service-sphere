import { CalendarDays, Clock, CheckCircle2, XCircle, Loader2, MessageCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ReviewDialog from '@/components/ReviewDialog';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  accepted: { label: 'Accepted', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  completed: { label: 'Completed', variant: 'outline', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviewBooking, setReviewBooking] = useState<any>(null);

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['bookings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, service_providers(*), services(*)')
        .eq('customer_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data || []).map(b => (b.service_providers as any)?.user_id).filter(Boolean))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('*').in('user_id', userIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Fetch existing reviews for completed bookings
      const completedIds = (data || []).filter(b => b.status === 'completed').map(b => b.id);
      const { data: reviews } = completedIds.length > 0
        ? await supabase.from('reviews').select('booking_id').in('booking_id', completedIds)
        : { data: [] };
      const reviewedSet = new Set((reviews || []).map(r => r.booking_id));

      return (data || []).map(b => ({
        ...b,
        providerName: profileMap.get((b.service_providers as any)?.user_id)?.full_name || 'Provider',
        serviceName: (b.services as any)?.name,
        hasReview: reviewedSet.has(b.id),
      }));
    },
  });

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' as const })
      .eq('id', bookingId);
    if (error) {
      toast.error('Failed to cancel');
    } else {
      toast.success('Booking cancelled');
      refetch();
    }
  };

  const handleChat = async (providerId: string) => {
    // Navigate to chat - the conversation should already exist
    navigate('/chat', { state: { openProviderId: providerId } });
  };

  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20">
        <div className="px-4 pt-6">
          <h1 className="text-xl font-bold">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Your upcoming and past bookings</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-lg">No bookings yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Book a service provider from the Explore tab to see your bookings here.
            </p>
          </div>
        ) : (
          <div className="px-4 mt-4 space-y-3">
            {bookings.map((b) => {
              const config = statusConfig[b.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <div key={b.id} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{b.providerName}</h3>
                    <Badge variant={config.variant} className="text-xs">
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  {b.serviceName && (
                    <p className="text-xs text-muted-foreground">Service: {b.serviceName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Booked {format(new Date(b.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                  <div className="flex gap-2 pt-1">
                    {b.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/20 rounded-lg"
                        onClick={() => handleCancel(b.id)}
                      >
                        Cancel
                      </Button>
                    )}
                    {b.status === 'accepted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => handleChat(b.provider_id)}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        Chat
                      </Button>
                    )}
                    {b.status === 'completed' && !b.hasReview && (
                      <Button
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setReviewBooking(b)}
                      >
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewBooking && (
        <ReviewDialog
          open={!!reviewBooking}
          onOpenChange={(open) => !open && setReviewBooking(null)}
          bookingId={reviewBooking.id}
          providerId={reviewBooking.provider_id}
          providerName={reviewBooking.providerName}
          customerId={user!.id}
          onReviewed={() => refetch()}
        />
      )}
    </PageTransition>
  );
};

export default Bookings;
