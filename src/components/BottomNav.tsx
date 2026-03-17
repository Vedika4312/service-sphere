import { Compass, CalendarDays, MessageCircle, User, LayoutDashboard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  if (location.pathname === '/auth') return null;

  const customerItems = [
    { path: '/', label: 'Explore', icon: Compass },
    { path: '/bookings', label: 'Bookings', icon: CalendarDays },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: user ? '/profile' : '/auth', label: user ? 'Profile' : 'Sign In', icon: User },
  ];

  const providerItems = [
    { path: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/provider/bookings', label: 'Bookings', icon: CalendarDays },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const navItems = role === 'provider' ? providerItems : customerItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-xl transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
