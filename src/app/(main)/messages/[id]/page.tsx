"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { VideoCall } from "@/components/calls/VideoCall";
import { AudioCall } from "@/components/calls/AudioCall";
import { GiftPicker } from "@/components/ui/gift-picker";
import { Gift, ArrowLeft, Phone, Video, Send, Smile, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatRoomPage() {
  const { id: receiverId } = useParams() as { id: string };
  const router = useRouter();
  
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = React.useState<any>(null);
  
  const [activeCall, setActiveCall] = React.useState<'audio' | 'video' | null>(null);
  const [showGifts, setShowGifts] = React.useState(false);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const channelRef = React.useRef<any>(null);

  // Helper to generate a unique conversation key for local storage
  const getConversationKey = (userA: string, userB: string) => {
    return `chat_${[userA, userB].sort().join('_')}`;
  };

  React.useEffect(() => {
    async function initChat() {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      // 2. Fetch Receiver Profile info (for Header)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', receiverId)
        .single();
      if (profile) setReceiverProfile(profile);

      // 3. Load Local Messages
      const chatKey = getConversationKey(user.id, receiverId);
      const savedMessages = localStorage.getItem(chatKey);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch(e) {
          console.error("Error parsing local messages");
        }
      }

      // 4. Setup Supabase Broadcast for Realtime P2P
      const channel = supabase.channel(`chat_room_${chatKey}`);
      channel.on('broadcast', { event: 'new_message' }, (payload) => {
        const incomingMessage = payload.payload as Message;
        
        // Save to state
        setMessages((prev) => {
          const updated = [...prev, incomingMessage];
          // Save to local storage
          localStorage.setItem(chatKey, JSON.stringify(updated));
          return updated;
        });
      });

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Connected to P2P Chat Room");
        }
      });

      channelRef.current = channel;
    }

    initChat();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [receiverId, router]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    // 1. Update State
    const updatedMessages = [...messages, msg];
    setMessages(updatedMessages);
    setNewMessage("");

    // 2. Save to Local Storage
    const chatKey = getConversationKey(currentUserId, receiverId);
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

    // 3. Broadcast to receiver
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new_message',
        payload: msg
      });
    }
  };

  const handleSendGift = (giftId: number, coins: number) => {
    if (!currentUserId) return;
    
    const msg: Message = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      content: `🎁 Sent a gift (${coins} coins)`,
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...messages, msg];
    setMessages(updatedMessages);
    
    const chatKey = getConversationKey(currentUserId, receiverId);
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new_message',
        payload: msg
      });
    }
    
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
            <img 
              src={receiverProfile?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${receiverProfile?.full_name || 'user'}`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">{receiverProfile?.full_name || 'Anonymous'}</h2>
            <p className="text-xs text-[var(--foreground)]/50">@{receiverProfile?.username || 'user'}</p>
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
        <div className="text-center text-xs text-[var(--foreground)]/40 my-4">
          Chat securely. Messages are stored only on your device.
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                isMe 
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-br-sm' 
                  : 'bg-gray-200 dark:bg-gray-800 text-[var(--foreground)] rounded-bl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
              placeholder="Type a secure message..." 
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
      {activeCall === 'video' && <VideoCall receiverName={receiverProfile?.full_name || 'User'} onEndCall={() => setActiveCall(null)} />}
      {activeCall === 'audio' && <AudioCall receiverName={receiverProfile?.full_name || 'User'} onEndCall={() => setActiveCall(null)} />}

    </div>
  );
}
