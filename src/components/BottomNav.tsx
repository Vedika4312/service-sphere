import { Compass, CalendarDays, MessageCircle, User, LayoutDashboard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count', user?.id],
    enabled: !!user,
    refetchInterval: 10000,
    queryFn: async () => {
      // Get conversations for this user
      const { data: convos } = await supabase.from('conversations').select('id');
      if (!convos?.length) return 0;
      const convoIds = convos.map(c => c.id);
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convoIds)
        .neq('sender_id', user!.id)
        .eq('is_read', false);
      return count || 0;
    },
  });

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
          const showBadge = item.path === '/chat' && unreadCount > 0;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-xl transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
