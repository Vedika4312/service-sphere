import { useState } from 'react';
import { ToggleLeft, Package, Plus, Trash2, Loader2, Navigation, CalendarDays, Clock, Wrench } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: bookingStats } = useQuery({
    queryKey: ['provider-booking-stats', provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status')
        .eq('provider_id', provider!.id);
      if (error) throw error;
      const all = data || [];
      return {
        total: all.length,
        pending: all.filter(b => b.status === 'pending').length,
        completed: all.filter(b => b.status === 'completed').length,
      };
    },
  });

  const handleToggle = async (checked: boolean) => {
    if (!provider) return;
    const { error } = await supabase
      .from('service_providers')
      .update({ is_online: checked })
      .eq('id', provider.id);
    if (error) toast.error('Failed to update status');
    else {
      toast.success(checked ? 'You are now Online!' : 'You are now Offline');
      queryClient.invalidateQueries({ queryKey: ['my-provider'] });
    }
  };

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
      () => { toast.error('Location access denied'); setUpdatingLocation(false); }
    );
  };

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
    if (error) toast.error('Failed to add service');
    else {
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
    else { toast.success('Service removed'); refetchServices(); }
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
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20 px-4 pt-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your services and availability</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <Card className="rounded-2xl">
            <CardContent className="p-3 flex flex-col items-center text-center">
              <CalendarDays className="h-5 w-5 text-primary mb-1" />
              <p className="text-lg font-bold">{bookingStats?.total ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-3 flex flex-col items-center text-center">
              <Clock className="h-5 w-5 text-amber-500 mb-1" />
              <p className="text-lg font-bold">{bookingStats?.pending ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-3 flex flex-col items-center text-center">
              <Wrench className="h-5 w-5 text-emerald-500 mb-1" />
              <p className="text-lg font-bold">{services.length}</p>
              <p className="text-[10px] text-muted-foreground">Services</p>
            </CardContent>
          </Card>
        </div>

        {/* Online toggle */}
        <Card className="mt-4 rounded-2xl">
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
              {updatingLocation ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <Navigation className="h-6 w-6 text-muted-foreground" />}
              <p className="text-xs font-medium">Update Location</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAddService(!showAddService)}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <Package className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs font-medium">{showAddService ? 'Hide Form' : 'Add Service'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add service form */}
        {showAddService && (
          <Card className="mt-4 rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Service Name</Label>
                <Input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="e.g. Pipe Repair" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price (₹)</Label>
                <Input type="number" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} placeholder="0" className="rounded-xl" />
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
                <Package className="h-5 w-5" /> My Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    {s.price > 0 && <p className="text-xs text-muted-foreground">₹{s.price}</p>}
                  </div>
                  <button onClick={() => handleDeleteService(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default ProviderDashboard;
