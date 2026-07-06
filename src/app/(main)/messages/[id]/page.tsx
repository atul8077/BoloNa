"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { VideoCall } from "@/components/calls/VideoCall";
import { AudioCall } from "@/components/calls/AudioCall";
import { GiftPicker } from "@/components/ui/gift-picker";
import { Gift, ArrowLeft, Phone, Video, Send, Smile, MoreVertical, Check, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import { AGORA_APP_ID } from "@/lib/agora";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: string; // 'sent', 'delivered', 'read'
  created_at: string;
}

let ringtoneAudio: HTMLAudioElement | null = null;
const playRingtone = () => {
  if (typeof window !== 'undefined') {
    if (!ringtoneAudio) {
      ringtoneAudio = new Audio('/ring.mp3');
      ringtoneAudio.loop = true;
    }
    ringtoneAudio.play().catch(e => console.log('Audio play failed', e));
  }
};
const stopRingtone = () => {
  if (ringtoneAudio) {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
  }
};

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

  React.useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      // Fetch Receiver Profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', receiverId)
        .single();
      if (profile) setReceiverProfile(profile);

      // Fetch existing messages from DB
      const { data: dbMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (dbMessages) {
        setMessages(dbMessages);
        
        // Mark unread received messages as 'read'
        const unreadIds = dbMessages.filter(m => m.receiver_id === user.id && m.status !== 'read').map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ status: 'read' }).in('id', unreadIds);
        }
      }

      // Setup Supabase Realtime for DB sync (to track message statuses and new messages)
      const messageSyncChannel = supabase.channel(`messages_${chatChannelName}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMsg = payload.new as Message;
            if (
              (newMsg.sender_id === user.id && newMsg.receiver_id === receiverId) ||
              (newMsg.sender_id === receiverId && newMsg.receiver_id === user.id)
            ) {
              setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });

              // Mark as read if we received it while chat is open
              if (newMsg.receiver_id === user.id && newMsg.status !== 'read') {
                supabase.from('messages').update({ status: 'read' }).eq('id', newMsg.id).then();
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          (payload) => {
            const updatedMsg = payload.new as Message;
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
          }
        )
        .subscribe();

      // Setup Agora RTM for Call Rings (and fallback messaging transmission if wanted)
      if (AGORA_APP_ID && typeof window !== 'undefined') {
        try {
          const AgoraRTMModule = await import('agora-rtm-sdk');
          const AgoraRTM = AgoraRTMModule.default || AgoraRTMModule;
          
          if (!AgoraRTM.RTM) {
            throw new Error("AgoraRTM.RTM is undefined. Module structure: " + Object.keys(AgoraRTM).join(","));
          }
          
          const rtmClient = new AgoraRTM.RTM(AGORA_APP_ID, user.id);
          
          rtmClient.addEventListener('message', (event: any) => {
             if (event.channelName === `call_ring_${user.id}`) {
              try {
                const callInfo = JSON.parse(event.message);
                if (callInfo.type === 'ring') {
                  playRingtone();
                  toast((t) => (
                    <div className="flex flex-col space-y-2">
                      <span className="font-bold">{callInfo.callerName} is calling...</span>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => { stopRingtone(); setActiveCall(callInfo.callType); toast.dismiss(t.id); }}>Answer</Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200" onClick={() => { stopRingtone(); toast.dismiss(t.id); }}>Decline</Button>
                      </div>
                    </div>
                  ), { duration: 30000 });
                  
                  // Failsafe: stop ringtone after 30 seconds if toast auto-dismisses
                  setTimeout(() => stopRingtone(), 30000);
                }
              } catch(e) {
                console.error("Failed to parse ring");
              }
            }
          });

          // Fetch RTM Token securely from backend
          const tokenRes = await fetch(`/api/agora/token?uid=${user.id}&tokenType=rtm`);
          const tokenData = await tokenRes.json();
          if (tokenData.error) throw new Error(tokenData.error);

          await rtmClient.login({ token: tokenData.token });
          await rtmClient.subscribe(`call_ring_${user.id}`);
          rtmClientRef.current = rtmClient;
        } catch (error: any) {
          console.error("Failed to initialize Agora RTM:", error);
          toast.error("Agora Error: " + (error.message || String(error)));
        }
      }

      return () => {
        supabase.removeChannel(messageSyncChannel);
      };
    }

    const cleanupPromise = initChat();

    return () => {
      if (rtmClientRef.current) {
        rtmClientRef.current.logout();
      }
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [receiverId, router, chatChannelName]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    const tempId = Date.now().toString();
    const msg: Message = {
      id: tempId, // temp id
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: newMessage,
      status: 'sent',
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages(prev => [...prev, msg]);
    setNewMessage("");

    // Insert into DB
    const { data: insertedData, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: msg.content,
        status: 'sent'
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
      // Replace optimistic message with real DB message
      setMessages(prev => prev.map(m => m.id === tempId ? insertedData : m));

      // Trigger Backend Push Notification
      const profileRes = await supabase.from('profiles').select('full_name').eq('id', currentUserId).single();
      const myName = profileRes.data?.full_name || 'Someone';

      fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: receiverId,
          payload: {
            title: `New message from ${myName}`,
            body: msg.content,
            url: `/messages/${currentUserId}`
          }
        })
      }).catch(console.error);
    }
  };

  const handleSendGift = async (giftId: number, coins: number) => {
    if (!currentUserId) return;
    
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: `🎁 Sent a gift (${coins} coins)`,
      status: 'sent'
    });

    if (error) {
      toast.error("Failed to send gift message");
    } else {
      toast.success(`Gift sent successfully! (-${coins} coins)`);
    }
  };

  const startCall = async (type: 'audio' | 'video') => {
    if (!currentUserId || !rtmClientRef.current) {
      toast.error("Calling is currently unavailable (Waiting for Agora Connect)");
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
      
      // Log Call initiation to DB
      await supabase.from('call_logs').insert({
        caller_id: currentUserId,
        receiver_id: receiverId,
        call_type: type,
        status: 'initiated'
      });

      // Trigger Backend Push Notification for offline ring
      fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: receiverId,
          payload: {
            title: `Incoming ${type} call from ${myName}`,
            body: "Tap to answer",
            url: `/messages/${currentUserId}`
          }
        })
      }).catch(console.error);

      setActiveCall(type);
    } catch (e) {
      console.error("Failed to ring user", e);
      toast.error("Could not place the call.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] max-w-3xl mx-auto w-full bg-white/50 dark:bg-[#0F172A]/50 rounded-2xl overflow-hidden shadow-2xl border border-[var(--foreground)]/10 relative">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--foreground)]/10 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md z-10">
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
          Chat is end-to-end synced securely.
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 flex flex-col ${
                isMe 
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-br-sm' 
                  : 'bg-gray-200 dark:bg-gray-800 text-[var(--foreground)] rounded-bl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? 'text-white/70' : 'text-[var(--foreground)]/50'}`}>
                  <p className="text-[10px]">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {isMe && (
                    <span className="shrink-0">
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-blue-300" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--foreground)]/10 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md relative z-10">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon" className="text-[var(--primary)] rounded-full shrink-0" onClick={() => setShowGifts(!showGifts)}>
            <Gift className="w-5 h-5" />
          </Button>
          <div className="relative flex-1">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
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
      {activeCall === 'video' && <VideoCall receiverName={receiverProfile?.full_name || 'User'} channelName={`call_${chatChannelName}`} currentUserId={currentUserId!} onEndCall={() => setActiveCall(null)} />}
      {activeCall === 'audio' && <AudioCall receiverName={receiverProfile?.full_name || 'User'} channelName={`call_${chatChannelName}`} currentUserId={currentUserId!} onEndCall={() => setActiveCall(null)} />}

    </div>
  );
}
