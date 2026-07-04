"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Check, CheckCheck } from "lucide-react";

const mockConversations = [
  { id: "1", name: "Aisha Sharma", image: "https://i.pravatar.cc/150?u=aisha", lastMessage: "Hey! How are you doing?", time: "10:30 AM", unread: 2, isOnline: true },
  { id: "2", name: "Rahul Verma", image: "https://i.pravatar.cc/150?u=rahul", lastMessage: "Let's catch up later today.", time: "Yesterday", unread: 0, isOnline: false },
  { id: "3", name: "Priya Singh", image: "https://i.pravatar.cc/150?u=priya", lastMessage: "Loved your recent story! ❤️", time: "Monday", unread: 1, isOnline: true },
  { id: "4", name: "Vikram Reddy", image: "https://i.pravatar.cc/150?u=vikram", lastMessage: "Sure, see you then.", time: "Sunday", unread: 0, isOnline: false },
];

export default function MessagesListPage() {
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
        {mockConversations.map((conv) => (
          <Link key={conv.id} href={`/messages/${conv.id}`}>
            <div className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-[var(--foreground)]/5 transition cursor-pointer">
              
              <div className="relative">
                <img src={conv.image} alt={conv.name} className="w-14 h-14 rounded-full object-cover" />
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
                  <p className={`text-sm truncate pr-4 ${conv.unread > 0 ? "font-semibold text-[var(--foreground)]" : "text-[var(--foreground)]/60"}`}>
                    {conv.lastMessage}
                  </p>
                  
                  {conv.unread > 0 ? (
                    <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unread}
                    </div>
                  ) : (
                    <CheckCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
