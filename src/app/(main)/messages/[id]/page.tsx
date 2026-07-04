"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { VideoCall } from "@/components/calls/VideoCall";
import { AudioCall } from "@/components/calls/AudioCall";
import { GiftPicker } from "@/components/ui/gift-picker";
import { Gift, ArrowLeft, Phone, Video, Send, Smile, Paperclip, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [activeCall, setActiveCall] = React.useState<'audio' | 'video' | null>(null);
  const [showGifts, setShowGifts] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // 1. Get current user
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || 'mock-user-id');
    };
    fetchUser();

    // 2. Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);
    };
    fetchMessages();

    // 3. Subscribe to Realtime updates
    const channel = supabase
      .channel(`realtime:messages:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${id}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    // Mock initial data if DB is empty for UI demonstration
    if (messages.length === 0) {
      setMessages([
        { id: '1', sender_id: 'other', content: 'Hey there! How is it going?', created_at: new Date().toISOString() },
        { id: '2', sender_id: 'mock-user-id', content: 'Hi! I am doing great, just checking out this new app.', created_at: new Date().toISOString() },
      ]);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    // Optimistic UI update for mock logic
    const tempMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      content: newMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");

    // Actual DB Insert (Uncomment when fully wired)
    /*
    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: currentUserId,
      content: tempMsg.content
    });
    */
  };

  const handleSendGift = (giftId: number, coins: number) => {
    // Optimistic UI for sending a gift
    const tempMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId || 'mock',
      content: `🎁 Sent a gift (${coins} coins)`,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    toast.success(`Gift sent successfully! (-${coins} coins)`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] max-w-3xl mx-auto w-full bg-white/50 dark:bg-[#0F172A]/50 rounded-2xl overflow-hidden shadow-2xl border border-[var(--foreground)]/10 relative">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--foreground)]/10 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative">
            <img src="https://i.pravatar.cc/150?u=aisha" alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">Aisha Sharma</h2>
            <p className="text-xs text-[var(--foreground)]/50">Online</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full text-[var(--primary)]" onClick={() => setActiveCall('audio')}>
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-[var(--primary)]" onClick={() => setActiveCall('video')}>
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-[var(--foreground)]/60">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-xs text-[var(--foreground)]/40 my-4">Today</div>
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                isMe 
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-br-sm' 
                  : 'bg-gray-200 dark:bg-gray-800 text-[var(--foreground)] rounded-bl-sm'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-[var(--foreground)]/50'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--foreground)]/10 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md relative">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon" className="text-[var(--primary)] rounded-full shrink-0" onClick={() => setShowGifts(!showGifts)}>
            <Gift className="w-5 h-5" />
          </Button>
          <div className="relative flex-1">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="pl-4 pr-10 rounded-full bg-[var(--background)] border-none h-12"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 rounded-full h-10 w-10">
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          <Button type="submit" disabled={!newMessage.trim()} className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full h-12 w-12 shrink-0 border-none">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
      
      {/* Gift Picker Overlay */}
      {showGifts && <GiftPicker onClose={() => setShowGifts(false)} onSendGift={handleSendGift} />}
      
      {/* Call Overlays */}
      {activeCall === 'video' && <VideoCall receiverName="Aisha Sharma" onEndCall={() => setActiveCall(null)} />}
      {activeCall === 'audio' && <AudioCall receiverName="Aisha Sharma" onEndCall={() => setActiveCall(null)} />}

    </div>
  );
}
