"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, DollarSign, Activity, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    activeCreators: 0,
    todaysRevenue: 0,
    activeStreams: 0,
  });
  const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
  const [pendingCreators, setPendingCreators] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Total Users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Active Creators
      const { count: activeCreators } = await supabase
        .from('creator_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // 3. Today's Revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: revenueData } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('transaction_type', 'recharge')
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());
        
      const todaysRevenue = revenueData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

      // 4. Active Streams
      const { count: activeStreams } = await supabase
        .from('live_streams')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'live');

      setStats({
        totalUsers: totalUsers || 0,
        activeCreators: activeCreators || 0,
        todaysRevenue,
        activeStreams: activeStreams || 0,
      });

      // 5. Recent Registrations
      const { data: recent } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (recent) setRecentUsers(recent);

      // 6. Pending Approvals
      const { data: pending } = await supabase
        .from('creator_profiles')
        .select('*, profiles(*)')
        .eq('status', 'pending');
        
      if (pending) setPendingCreators(pending);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('creator_profiles')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('profile_id', profileId);
        
      if (error) throw error;
      
      toast.success("Creator approved!");
      setPendingCreators(prev => prev.filter(p => p.profile_id !== profileId));
      
      // Update active creators count
      setStats(prev => ({ ...prev, activeCreators: prev.activeCreators + 1 }));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('creator_profiles')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('profile_id', profileId);
        
      if (error) throw error;
      
      toast.success("Creator application rejected.");
      setPendingCreators(prev => prev.filter(p => p.profile_id !== profileId));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500" },
    { title: "Active Creators", value: stats.activeCreators.toLocaleString(), icon: Video, color: "text-purple-500" },
    { title: "Today's Revenue", value: `₹${stats.todaysRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
    { title: "Active Streams", value: stats.activeStreams.toLocaleString(), icon: Activity, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-none shadow-md dark:bg-[#1E293B]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 ${stat.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Users */}
        <Card className="lg:col-span-2 border-none shadow-md dark:bg-[#1E293B]">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found.</div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map(user => {
                  const timeAgo = new Date(user.created_at).toLocaleDateString();
                  const avatar = user.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.full_name || 'user'}`;
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <div className="flex items-center space-x-4">
                        <img src={avatar} className="w-10 h-10 rounded-full object-cover" alt="Avatar" />
                        <div>
                          <p className="font-medium text-sm">{user.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">@{user.username || 'user'}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">Joined: {timeAgo}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card className="border-none shadow-md dark:bg-[#1E293B]">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCreators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending applications.</div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {pendingCreators.map(creator => {
                  const profile = creator.profiles;
                  const name = profile?.full_name || 'Unknown User';
                  
                  return (
                    <div key={creator.profile_id} className="flex flex-col border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">Creator Application</p>
                          <p className="text-xs text-gray-500">{name}</p>
                        </div>
                        <p className="text-xs text-[var(--primary)] cursor-pointer hover:underline">Review Profile</p>
                      </div>
                      <div className="flex space-x-2 w-full mt-2">
                        <button 
                          onClick={() => handleApprove(creator.profile_id)}
                          className="flex-1 text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 px-2 py-2 rounded transition-colors font-medium"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(creator.profile_id)}
                          className="flex-1 text-xs bg-red-500/10 text-red-600 hover:bg-red-500/20 px-2 py-2 rounded transition-colors font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
