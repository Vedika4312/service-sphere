import { User, Settings, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Profile = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20">
        <div className="px-4 pt-6">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>

        <div className="px-4 mt-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
              {initials}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.user_metadata?.full_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                {role || 'customer'}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-secondary transition-colors min-h-[52px]">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Account Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            {role === 'provider' && (
              <button
                onClick={() => navigate('/provider/dashboard')}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-secondary transition-colors min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Provider Dashboard</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full mt-8 h-12 rounded-xl text-destructive border-destructive/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
