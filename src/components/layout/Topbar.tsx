"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Home, Compass, MessageCircle, User, Wallet, Video, Sparkles, Settings, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { supabase } from "@/lib/supabase";

export function Topbar() {
  const pathname = usePathname();
  const [username, setUsername] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
        if (data?.username) {
          setUsername(data.username);
        }
      }
    }
    loadUser();
  }, []);

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Discover", href: "/discovery", icon: Compass },
    { name: "Messages", href: "/messages", icon: MessageCircle },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Creator", href: "/creator", icon: Video },
    { name: "AI Match", href: "/ai-match", icon: Sparkles },
    { name: "Premium", href: "/premium", icon: Crown },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--foreground)]/10 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white font-bold">
            B
          </div>
          <span className="hidden font-bold sm:inline-block text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            BoloNa
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 transition-colors hover:text-[var(--primary)]",
                  isActive ? "text-[var(--primary)] font-semibold" : "text-[var(--foreground)]/60"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Global Search & User Actions */}
        <div className="flex items-center space-x-4">
          {username && (
            <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold text-sm border border-[var(--primary)]/20">
              @{username}
            </div>
          )}
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors">
            <Search className="h-5 w-5 text-[var(--foreground)]/70" />
          </button>
        </div>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--foreground)]/10 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  isActive ? "text-[var(--primary)]" : "text-[var(--foreground)]/60"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive && "fill-current/20")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
