import { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

interface ConversationWithDetails {
  id: string;
  customer_id: string;
  provider_id: string;
  updated_at: string;
  otherName: string;
  lastMessage?: string;
  unreadCount: number;
}

const Chat = () => {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const locationState = useLocation().state as any;
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: convosLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;

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

      const convoIds = (data || []).map(c => c.id);
      const { data: allMessages } = convoIds.length > 0
        ? await supabase.from('messages').select('*').in('conversation_id', convoIds).order('created_at', { ascending: false })
        : { data: [] };

      const lastMsgMap = new Map<string, string>();
      const unreadMap = new Map<string, number>();
      (allMessages || []).forEach(m => {
        if (!lastMsgMap.has(m.conversation_id)) {
          lastMsgMap.set(m.conversation_id, m.content);
        }
        if (m.sender_id !== user?.id && !m.is_read) {
          unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
        }
      });

      return (data || []).map(c => ({
        ...c,
        otherName: role === 'provider'
          ? profileMap.get(c.customer_id) || 'Customer'
          : providerMap.get(c.provider_id) || 'Provider',
        lastMessage: lastMsgMap.get(c.id),
        unreadCount: unreadMap.get(c.id) || 0,
      })) as ConversationWithDetails[];
    },
  });

  // Auto-open conversation from navigation state
  useEffect(() => {
    if (!conversations.length) return;
    if (locationState?.openProviderId) {
      const convo = conversations.find(c => c.provider_id === locationState.openProviderId);
      if (convo) setActiveConvo(convo.id);
    } else if (locationState?.openCustomerId) {
      const convo = conversations.find(c => c.customer_id === locationState.openCustomerId);
      if (convo) setActiveConvo(convo.id);
    }
  }, [conversations, locationState]);

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

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (!activeConvo || !user) return;
    const markRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', activeConvo)
        .neq('sender_id', user.id)
        .eq('is_read', false);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    };
    markRead();
  }, [activeConvo, user, messages.length]);

  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`messages-${activeConvo}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvo}` }, () => {
        refetchMessages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, refetchMessages]);

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
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeConvo);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (activeConvo) {
    const convo = conversations.find(c => c.id === activeConvo);
    return (
      <PageTransition>
        <div className="h-[100dvh] flex flex-col">
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

          <div className="flex-shrink-0 p-3 border-t border-border bg-background/80 backdrop-blur-xl safe-area-bottom">
            <div className="flex gap-2">
              <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="rounded-xl" />
              <Button size="icon" className="rounded-xl shrink-0" onClick={handleSend} disabled={sending || !messageText.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

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
                <div className="relative w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                  {c.otherName[0].toUpperCase()}
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                      {c.unreadCount > 9 ? '9+' : c.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${c.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>{c.otherName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(c.updated_at), 'MMM d')}
                    </p>
                  </div>
                  {c.lastMessage && (
                    <p className={`text-xs truncate mt-0.5 ${c.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{c.lastMessage}</p>
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
