"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlidersHorizontal, MapPin, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DiscoveryPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    async function fetchUsers() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id); // Exclude current user

      if (data) {
        setUsers(data);
        setFilteredUsers(data);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [router]);

  // Handle Search
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(u => 
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.full_name && u.full_name.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discovery</h1>
          <p className="text-[var(--foreground)]/60 text-sm">Find friends by name or @username</p>
        </div>
        
        <div className="flex w-full md:w-96 space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50" />
            <Input 
              className="pl-9 bg-white/50 dark:bg-white/5 border-none" 
              placeholder="Search by name or @username" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="shrink-0 bg-white/50 dark:bg-white/5 border-none">
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Discovery Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white/50 dark:bg-white/5 rounded-xl mt-8">
          No users found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.map((profile) => {
            const avatar = profile.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.full_name || 'user'}`;
            return (
              <Link href={`/messages/${profile.id}`} key={profile.id}>
                <div className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gray-200 dark:bg-gray-800">
                  <img 
                    src={avatar} 
                    alt={profile.full_name || 'Profile'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-lg leading-tight">{profile.full_name || 'Anonymous'}</h3>
                    <p className="text-sm opacity-90 mb-1">@{profile.username}</p>
                    <div className="flex items-center text-xs opacity-80 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {[profile.city, profile.state].filter(Boolean).join(', ') || 'Global'}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
