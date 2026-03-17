import { Loader2, Inbox } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ProviderBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: provider } = useQuery({
    queryKey: ['my-provider', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['provider-bookings', provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', provider!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const customerIds = [...new Set((data || []).map(b => b.customer_id))];
      const { data: profiles } = customerIds.length > 0
        ? await supabase.from('profiles').select('*').in('user_id', customerIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const serviceIds = [...new Set((data || []).filter(b => b.service_id).map(b => b.service_id!))];
      const { data: services } = serviceIds.length > 0
        ? await supabase.from('services').select('*').in('id', serviceIds)
        : { data: [] };
      const serviceMap = new Map((services || []).map(s => [s.id, s]));

      return (data || []).map(b => ({
        ...b,
        customerName: profileMap.get(b.customer_id)?.full_name || 'Customer',
        customerPhone: profileMap.get(b.customer_id)?.phone || null,
        serviceName: b.service_id ? serviceMap.get(b.service_id)?.name || 'Service' : null,
      }));
    },
  });

  const handleAction = async (bookingId: string, status: 'accepted' | 'rejected' | 'completed') => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) toast.error('Failed to update booking');
    else {
      toast.success(`Booking ${status}`);
      refetch();
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'accepted': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const pending = bookings.filter(b => b.status === 'pending');
  const others = bookings.filter(b => b.status !== 'pending');

  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20 px-4 pt-6">
        <h1 className="text-xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage customer requests</p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No bookings yet</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="mt-5">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">Pending Requests ({pending.length})</h2>
                <div className="space-y-3">
                  {pending.map(b => (
                    <Card key={b.id} className="rounded-2xl border-amber-500/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{b.customerName}</p>
                            {b.customerPhone && (
                              <p className="text-xs text-muted-foreground">{b.customerPhone}</p>
                            )}
                          </div>
                          <Badge className={statusColor(b.status)} variant="outline">
                            {b.status}
                          </Badge>
                        </div>
                        {b.serviceName && (
                          <p className="text-xs text-muted-foreground">Service: <span className="font-medium text-foreground">{b.serviceName}</span></p>
                        )}
                        {b.notes && (
                          <p className="text-xs text-muted-foreground">Note: {b.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(b.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="rounded-xl flex-1" onClick={() => handleAction(b.id, 'accepted')}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl flex-1 text-destructive" onClick={() => handleAction(b.id, 'rejected')}>
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div className="mt-5">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">All Bookings</h2>
                <div className="space-y-3">
                  {others.map(b => (
                    <Card key={b.id} className="rounded-2xl">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{b.customerName}</p>
                            {b.customerPhone && (
                              <p className="text-xs text-muted-foreground">{b.customerPhone}</p>
                            )}
                          </div>
                          <Badge className={statusColor(b.status)} variant="outline">
                            {b.status}
                          </Badge>
                        </div>
                        {b.serviceName && (
                          <p className="text-xs text-muted-foreground">Service: <span className="font-medium text-foreground">{b.serviceName}</span></p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(b.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        {b.status === 'accepted' && (
                          <Button size="sm" variant="outline" className="rounded-xl w-full mt-1" onClick={() => handleAction(b.id, 'completed')}>
                            Mark Completed
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default ProviderBookings;
