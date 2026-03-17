import { useState, useEffect } from 'react';
import { ToggleLeft, MapPin, Package, Inbox, Plus, Trash2, Loader2, Navigation } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch provider record
  const { data: provider, isLoading: providerLoading } = useQuery({
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

  // Fetch my services
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ['my-services', provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', provider!.id)
        .order('created_at');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch incoming bookings
  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ['provider-bookings', provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', provider!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch customer profiles
      const customerIds = [...new Set((data || []).map(b => b.customer_id))];
      const { data: profiles } = customerIds.length > 0
        ? await supabase.from('profiles').select('*').in('user_id', customerIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      return (data || []).map(b => ({
        ...b,
        customerName: profileMap.get(b.customer_id)?.full_name || 'Customer',
      }));
    },
  });

  // Online toggle
  const handleToggle = async (checked: boolean) => {
    if (!provider) return;
    const { error } = await supabase
      .from('service_providers')
      .update({ is_online: checked })
      .eq('id', provider.id);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(checked ? 'You are now Online!' : 'You are now Offline');
      queryClient.invalidateQueries({ queryKey: ['my-provider'] });
    }
  };

  // Location update
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const handleUpdateLocation = () => {
    if (!provider) return;
    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { error } = await supabase
          .from('service_providers')
          .update({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          .eq('id', provider.id);
        if (error) toast.error('Failed to update location');
        else {
          toast.success('Location updated!');
          queryClient.invalidateQueries({ queryKey: ['my-provider'] });
        }
        setUpdatingLocation(false);
      },
      () => {
        toast.error('Location access denied');
        setUpdatingLocation(false);
      }
    );
  };

  // Add service form
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [addingService, setAddingService] = useState(false);

  const handleAddService = async () => {
    if (!provider || !newServiceName.trim()) return;
    setAddingService(true);
    const { error } = await supabase.from('services').insert({
      provider_id: provider.id,
      name: newServiceName.trim(),
      price: Number(newServicePrice) || 0,
    });
    if (error) {
      toast.error('Failed to add service');
    } else {
      toast.success('Service added!');
      setNewServiceName('');
      setNewServicePrice('');
      setShowAddService(false);
      refetchServices();
    }
    setAddingService(false);
  };

  const handleDeleteService = async (serviceId: string) => {
    const { error } = await supabase.from('services').delete().eq('id', serviceId);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Service removed');
      refetchServices();
    }
  };

  // Booking actions
  const handleBookingAction = async (bookingId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) toast.error('Failed to update booking');
    else {
      toast.success(`Booking ${status}`);
      refetchBookings();
    }
  };

  if (providerLoading) {
    return (
      <PageTransition>
        <div className="min-h-[100dvh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageTransition>
    );
  }

  if (!provider) {
    return (
      <PageTransition>
        <div className="min-h-[100dvh] pb-20 px-4 pt-6 text-center">
          <h1 className="text-xl font-bold">Provider Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-4">You don't have a provider profile yet.</p>
          <Button className="mt-4 rounded-xl" onClick={() => window.history.back()}>
            Back to Explore
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20 px-4 pt-6">
        <h1 className="text-xl font-bold">Provider Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your services and availability</p>

        {/* Online toggle */}
        <Card className="mt-6 rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Availability</p>
                <p className="text-xs text-muted-foreground">
                  {provider.is_online ? 'Accepting bookings' : 'Not visible to customers'}
                </p>
              </div>
            </div>
            <Switch checked={provider.is_online} onCheckedChange={handleToggle} />
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Card className="rounded-2xl cursor-pointer hover:shadow-md transition-shadow" onClick={handleUpdateLocation}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              {updatingLocation ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <Navigation className="h-6 w-6 text-muted-foreground" />
              )}
              <p className="text-xs font-medium">Update Location</p>
            </CardContent>
          </Card>
          <Card
            className="rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowAddService(!showAddService)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <Package className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs font-medium">
                {showAddService ? 'Hide Form' : 'Add Service'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add service form */}
        {showAddService && (
          <Card className="mt-4 rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Service Name</Label>
                <Input
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Pipe Repair"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (₹)</Label>
                <Input
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
              <Button onClick={handleAddService} disabled={addingService} className="w-full rounded-xl" size="sm">
                {addingService ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Service
              </Button>
            </CardContent>
          </Card>
        )}

        {/* My services */}
        {services.length > 0 && (
          <Card className="mt-4 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    {s.price > 0 && <p className="text-xs text-muted-foreground">₹{s.price}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteService(s.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Incoming requests */}
        <Card className="mt-4 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Incoming Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No incoming requests</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-secondary/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{b.customerName}</p>
                      <Badge variant="secondary" className="text-xs capitalize">{b.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(b.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-lg flex-1"
                          onClick={() => handleBookingAction(b.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg flex-1 text-destructive"
                          onClick={() => handleBookingAction(b.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full mt-6 h-12 rounded-xl" onClick={() => window.history.back()}>
          Back to Explore
        </Button>
      </div>
    </PageTransition>
  );
};

export default ProviderDashboard;
