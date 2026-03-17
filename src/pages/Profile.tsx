import { User, Settings, LogOut, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';

const Profile = () => {
  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20">
        <div className="px-4 pt-6">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>

        <div className="px-4 mt-6">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Guest User</h2>
              <p className="text-sm text-muted-foreground">Sign in to manage your profile</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="mt-6 space-y-1">
            {[
              { label: 'Account Settings', icon: Settings },
              { label: 'Become a Provider', icon: User },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-secondary transition-colors min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-8 h-12 rounded-xl text-destructive border-destructive/20">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
