"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Video, DollarSign, Settings, LogOut, Flag, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState("");
  const [error, setError] = React.useState("");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "HarryPorter") {
      sessionStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F172A] p-4">
        <div className="bg-white dark:bg-[#1E293B] p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Restricted Area. Please enter the master password.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Enter password..." 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full h-12 text-center"
            />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <Button type="submit" className="w-full h-12 font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
              Unlock Portal
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Creators", href: "/admin/creators", icon: Video },
    { name: "Monetization", href: "/admin/monetization", icon: DollarSign },
    { name: "Reports", href: "/admin/reports", icon: Flag },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0F172A] text-[var(--foreground)]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] mr-3 flex items-center justify-center text-white font-bold">B</div>
          <h1 className="font-bold text-xl tracking-tight">Admin Panel</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-colors group cursor-pointer",
                  isActive ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}>
                  <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-[var(--primary)]" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => {
              sessionStorage.removeItem("adminAuth");
              setIsAuthenticated(false);
            }}
            className="flex items-center text-red-500 hover:text-red-600 font-medium px-3 py-2 w-full transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 md:px-8">
          <h2 className="text-xl font-semibold capitalize hidden md:block">
            {pathname.split('/').pop() || 'Dashboard'}
          </h2>
          {/* Mobile Header elements here */}
          <div className="flex items-center ml-auto space-x-4">
             <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Super Admin</span>
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-[#0F172A]">
          {children}
        </div>
      </main>

    </div>
  );
}
