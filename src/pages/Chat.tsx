import { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface ConversationWithDetails {
  id: string;
  customer_id: string;
  provider_id: string;
  updated_at: string;
  otherName: string;
  lastMessage?: string;
}

const Chat = () => {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: convosLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;

      // Fetch names for the other party
      const customerIds = [...new Set((data || []).map(c => c.customer_id))];
      const providerIds = [...new Set((data || []).map(c => c.provider_id))];

      const { data: profiles } = customerIds.length > 0
        ? await supabase.from('profiles').select('*').in('user_id', customerIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.full_name || 'User']));

      const { data: providers } = providerIds.length > 0
        ? await supabase.from('service_providers').select('id, user_id').in('id', providerIds)
        : { data: [] };
      const providerUserIds = (providers || []).map(p => p.user_id);
      const { data: providerProfiles } = providerUserIds.length > 0
        ? await supabase.from('profiles').select('*').in('user_id', providerUserIds)
        : { data: [] };
      const providerMap = new Map<string, string>();
      (providers || []).forEach(p => {
        const profile = (providerProfiles || []).find(pp => pp.user_id === p.user_id);
        providerMap.set(p.id, profile?.full_name || 'Provider');
      });

      // Fetch last message per conversation
      const convoIds = (data || []).map(c => c.id);
      const { data: lastMessages } = convoIds.length > 0
        ? await supabase.from('messages').select('*').in('conversation_id', convoIds).order('created_at', { ascending: false })
        : { data: [] };
      const lastMsgMap = new Map<string, string>();
      (lastMessages || []).forEach(m => {
        if (!lastMsgMap.has(m.conversation_id)) {
          lastMsgMap.set(m.conversation_id, m.content);
        }
      });

      return (data || []).map(c => ({
        ...c,
        otherName: role === 'provider'
          ? profileMap.get(c.customer_id) || 'Customer'
          : providerMap.get(c.provider_id) || 'Provider',
        lastMessage: lastMsgMap.get(c.id),
      })) as ConversationWithDetails[];
    },
  });

  // Fetch messages for active conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeConvo],
    enabled: !!activeConvo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConvo!)
        .order('created_at');
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeConvo) return;

    const channel = supabase
      .channel(`messages-${activeConvo}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvo}` },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, refetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeConvo || !user) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConvo,
      sender_id: user.id,
      content: messageText.trim(),
    });
    if (!error) {
      setMessageText('');
      // Update conversation updated_at
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeConvo);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Message thread view
  if (activeConvo) {
    const convo = conversations.find(c => c.id === activeConvo);
    return (
      <PageTransition>
        <div className="h-[100dvh] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3">
            <button onClick={() => { setActiveConvo(null); queryClient.invalidateQueries({ queryKey: ['conversations'] }); }} className="p-2 -ml-2 rounded-xl hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {(convo?.otherName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{convo?.otherName || 'Chat'}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {messages.map((m) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}>
                    <p>{m.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {format(new Date(m.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 border-t border-border bg-background/80 backdrop-blur-xl safe-area-bottom">
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="rounded-xl"
              />
              <Button size="icon" className="rounded-xl shrink-0" onClick={handleSend} disabled={sending || !messageText.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Conversation list view
  return (
    <PageTransition>
      <div className="min-h-[100dvh] pb-20">
        <div className="px-4 pt-6">
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === 'provider' ? 'Chat with your customers' : 'Chat with your service providers'}
          </p>
        </div>

        {convosLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-lg">No conversations</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Messages will appear here after you book a service or receive a booking.
            </p>
          </div>
        ) : (
          <div className="mt-4 px-4 space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                  {c.otherName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{c.otherName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(c.updated_at), 'MMM d')}
                    </p>
                  </div>
                  {c.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Chat;
