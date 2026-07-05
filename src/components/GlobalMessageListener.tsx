"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function GlobalMessageListener() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function setupListener() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const channel = supabase.channel('global_messages_listener')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          async (payload) => {
            const newMsg = payload.new as any;
            
            // Check if the user is already on the specific chat page for this sender
            if (pathname === `/messages/${newMsg.sender_id}`) {
              // They are already looking at the chat, no need to show a global notification.
              // (The specific chat page will handle marking it as read and updating UI)
              return;
            }

            // Fetch sender profile info for the notification
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', newMsg.sender_id)
              .single();

            const senderName = profile?.full_name || 'Someone';

            // Show toast notification
            toast((t) => (
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push(`/messages/${newMsg.sender_id}`);
                }}
              >
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${senderName}`} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover" 
                />
                <div>
                  <p className="font-semibold text-sm">New message from {senderName}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{newMsg.content}</p>
                </div>
              </div>
            ), {
              duration: 5000,
              position: 'top-center'
            });

            // Update status to 'delivered' since it reached the app but wasn't read
            if (newMsg.status === 'sent') {
               await supabase.from('messages').update({ status: 'delivered' }).eq('id', newMsg.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    setupListener();
  }, [pathname, router]);

  return null;
}
