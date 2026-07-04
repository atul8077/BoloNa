"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Video, DollarSign, Settings, LogOut, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          <button className="flex items-center text-red-500 hover:text-red-600 font-medium px-3 py-2 w-full transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
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
