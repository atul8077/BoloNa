"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MessagesListPage() {
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    async function loadConversations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const convos = [];
      const userIdsToFetch = new Set<string>();
      
      // Scan localStorage for chat keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_') && key.includes(user.id)) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const messages = JSON.parse(raw);
              if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                const parts = key.replace('chat_', '').split('_');
                const otherId = parts[0] === user.id ? parts[1] : parts[0];
                
                userIdsToFetch.add(otherId);
                convos.push({
                  otherId,
                  lastMessage: lastMsg.content,
                  time: lastMsg.created_at
                });
              }
            }
          } catch(e) {
            console.error("Error parsing chat key", key);
          }
        }
      }

      if (userIdsToFetch.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', Array.from(userIdsToFetch));

        if (profiles) {
          const enrichedConvos = convos.map(c => {
            const profile = profiles.find(p => p.id === c.otherId);
            return {
              id: c.otherId,
              name: profile?.full_name || 'Anonymous',
              username: profile?.username || 'user',
              image: profile?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.full_name || 'user'}`,
              lastMessage: c.lastMessage,
              time: new Date(c.time).toLocaleDateString(),
              unread: 0,
              isOnline: false
            };
          });
          // Sort by time descending (latest first)
          enrichedConvos.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setConversations(enrichedConvos);
        }
      }
      setLoading(false);
    }
    
    loadConversations();
  }, [router]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
      
      <div className="flex flex-col space-y-4 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50" />
          <Input className="pl-9 bg-white/50 dark:bg-white/5 border-none rounded-full h-12" placeholder="Search messages..." />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white/50 dark:bg-white/5 rounded-xl mt-8">
            No messages yet. Find a friend in Discovery and say Hi!
          </div>
        ) : (
          conversations.map((conv) => (
            <Link key={conv.id} href={`/messages/${conv.id}`}>
              <div className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-[var(--foreground)]/5 transition cursor-pointer">
                
                <div className="relative">
                  <img src={conv.image} alt={conv.name} className="w-14 h-14 rounded-full object-cover bg-gray-200 dark:bg-gray-800" />
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--background)] rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-lg truncate pr-2">{conv.name}</h3>
                    <span className="text-xs text-[var(--foreground)]/50 whitespace-nowrap">{conv.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm truncate pr-4 text-[var(--foreground)]/60">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>

              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
