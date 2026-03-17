import { MessageCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const Chat = () => {
  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20">
        <div className="px-4 pt-6">
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Chat with your service providers</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-lg">No conversations</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Messages with providers will appear here after you book a service.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Chat;
