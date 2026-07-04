"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    async function loadRecommendations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch random real users except current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(6); // Fetch 6 recommendations

      if (data) {
        setRecommendations(data);
      }
      setLoading(false);
    }
    loadRecommendations();
  }, [router]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Suggested Profiles */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Top Recommendations</h2>
          <Link href="/discovery">
            <Button variant="link">See All in Discovery</Button>
          </Link>
        </div>
        
        {recommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white/50 dark:bg-white/5 rounded-xl">
            No recommendations found yet. Invite some friends!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(profile => {
              const avatar = profile.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.full_name || 'user'}`;
              return (
                <Card key={profile.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white/50 dark:bg-white/5 backdrop-blur-md">
                  <div className="relative h-64 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img src={avatar} alt={profile.full_name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>New</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{profile.full_name || 'User'}</h3>
                      <p className="text-sm opacity-90">@{profile.username}</p>
                      <p className="text-xs opacity-75">{[profile.city, profile.state].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                  <CardContent className="p-4 flex justify-between">
                    <Link href={`/messages/${profile.id}`} className="w-full block">
                      <Button className="w-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] border-none hover:opacity-90">
                        <MessageSquare className="w-5 h-5 mr-2" /> Message
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Wallet Promo Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-[#312E81] p-8 text-white shadow-xl mt-8">
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white opacity-5 rounded-full blur-[30px]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
            <p className="opacity-80 max-w-md">Get unlimited chats, video calls, and see who liked your profile.</p>
          </div>
          <Link href="/premium">
            <Button className="mt-4 md:mt-0 bg-white text-[#1E1B4B] hover:bg-white/90 rounded-full px-8 h-12 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Explore Plans
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
