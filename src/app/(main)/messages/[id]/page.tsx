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
import { AGORA_APP_ID } from "@/lib/agora";

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
  const rtmClientRef = React.useRef<any>(null);
  const chatChannelName = React.useMemo(() => `chat_${[currentUserId || 'wait', receiverId].sort().join('_')}`, [currentUserId, receiverId]);

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

      // 2. Fetch Receiver Profile info
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

      // 4. Setup Agora RTM for Realtime P2P
      if (AGORA_APP_ID && typeof window !== 'undefined') {
        try {
          const AgoraRTM = (await import('agora-rtm-sdk')).default;
          
          const rtmClient = new AgoraRTM.RTM(AGORA_APP_ID, user.id);
          
          rtmClient.addEventListener('message', (event: any) => {
            // Check if message is for this chat
            if (event.channelName === chatKey) {
              try {
                const incomingMessage = JSON.parse(event.message) as Message;
                
                // Save to state and local storage
                setMessages((prev) => {
                  // prevent duplicates
                  if (prev.some(m => m.id === incomingMessage.id)) return prev;
                  
                  const updated = [...prev, incomingMessage];
                  localStorage.setItem(chatKey, JSON.stringify(updated));
                  return updated;
                });
              } catch(e) {
                console.error("Failed to parse incoming RTM message");
              }
            } else if (event.channelName === `call_ring_${user.id}`) {
              // Handle incoming call rings
              try {
                const callInfo = JSON.parse(event.message);
                if (callInfo.type === 'ring') {
                  toast((t) => (
                    <div className="flex flex-col space-y-2">
                      <span className="font-bold">{callInfo.callerName} is calling...</span>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => { setActiveCall(callInfo.callType); toast.dismiss(t.id); }}>Accept</Button>
                        <Button size="sm" variant="destructive" onClick={() => toast.dismiss(t.id)}>Decline</Button>
                      </div>
                    </div>
                  ), { duration: 30000 });
                }
              } catch(e) {
                console.error("Failed to parse ring");
              }
            }
          });

          await rtmClient.login();
          
          // Subscribe to the shared chat channel for messages
          await rtmClient.subscribe(chatKey);
          
          // Subscribe to personal channel for call rings
          await rtmClient.subscribe(`call_ring_${user.id}`);
          
          rtmClientRef.current = rtmClient;
          console.log("Agora RTM Connected");
          
        } catch (error) {
          console.error("Failed to initialize Agora RTM:", error);
          toast.error("Real-time messaging is disconnected.");
        }
      }
    }

    initChat();

    return () => {
      if (rtmClientRef.current) {
        rtmClientRef.current.logout();
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

    // 3. Broadcast to receiver via Agora RTM
    if (rtmClientRef.current && AGORA_APP_ID) {
      try {
        await rtmClientRef.current.publish(chatKey, JSON.stringify(msg));
      } catch (e) {
        console.error("Failed to send RTM message", e);
        toast.error("Failed to send message. You might be disconnected.");
      }
    } else if (!AGORA_APP_ID) {
      toast.error("Agora App ID is missing.");
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

    if (rtmClientRef.current) {
      rtmClientRef.current.publish(chatKey, JSON.stringify(msg)).catch(console.error);
    }
    
    toast.success(`Gift sent successfully! (-${coins} coins)`);
  };

  const startCall = async (type: 'audio' | 'video') => {
    if (!currentUserId || !rtmClientRef.current) {
      toast.error("Calling is currently unavailable");
      return;
    }
    
    const profileRes = await supabase.from('profiles').select('full_name').eq('id', currentUserId).single();
    const myName = profileRes.data?.full_name || 'Someone';

    // Ring the receiver
    try {
      await rtmClientRef.current.publish(`call_ring_${receiverId}`, JSON.stringify({
        type: 'ring',
        callType: type,
        callerId: currentUserId,
        callerName: myName
      }));
      setActiveCall(type);
    } catch (e) {
      console.error("Failed to ring user", e);
      toast.error("Could not place the call.");
    }
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
              className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-800" 
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">{receiverProfile?.full_name || 'Anonymous'}</h2>
            <p className="text-xs text-[var(--foreground)]/50">@{receiverProfile?.username || 'user'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full text-[var(--primary)]" onClick={() => startCall('audio')}>
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-[var(--primary)]" onClick={() => startCall('video')}>
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
          Chat securely via Agora. Messages are stored only on your device.
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
              className="pl-4 pr-10 rounded-full bg-[var(--background)] border-none h-12 focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 rounded-full h-10 w-10">
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          <Button type="submit" disabled={!newMessage.trim()} className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full h-12 w-12 shrink-0 border-none hover:opacity-90">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
      
      {/* Gift Picker Overlay */}
      {showGifts && <GiftPicker onClose={() => setShowGifts(false)} onSendGift={handleSendGift} />}
      
      {/* Call Overlays */}
      {activeCall === 'video' && <VideoCall receiverName={receiverProfile?.full_name || 'User'} channelName={`call_${chatChannelName}`} onEndCall={() => setActiveCall(null)} />}
      {activeCall === 'audio' && <AudioCall receiverName={receiverProfile?.full_name || 'User'} channelName={`call_${chatChannelName}`} onEndCall={() => setActiveCall(null)} />}

    </div>
  );
}
