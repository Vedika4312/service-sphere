import { ToggleLeft, MapPin, Package, Inbox } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

const ProviderDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsOnline(checked);
    toast.success(checked ? 'You are now Online!' : 'You are now Offline');
  };

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
                <p className="text-xs text-muted-foreground">{isOnline ? 'Accepting bookings' : 'Not visible to customers'}</p>
              </div>
            </div>
            <Switch checked={isOnline} onCheckedChange={handleToggle} />
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Card className="rounded-2xl">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <MapPin className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs font-medium">Update Location</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <Package className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs font-medium">My Services</p>
            </CardContent>
          </Card>
        </div>

        {/* Incoming requests */}
        <Card className="mt-4 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Incoming Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">No incoming requests</p>
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
