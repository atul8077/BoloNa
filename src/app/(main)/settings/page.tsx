"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Bell, UserX, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
        if (data?.username) setUsername(data.username);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdateUsername = async () => {
    if (!username.trim()) return;
    setIsUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').update({ username: username.trim() }).eq('id', user.id);
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error("This username is already taken.");
        } else {
          toast.error("Failed to update username.");
        }
      } else {
        toast.success("Username updated successfully!");
      }
    }
    setIsUpdating(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings & Privacy</h1>
        <p className="text-[var(--foreground)]/60 text-sm mt-1">Manage your account security and preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Security & Privacy */}
        {/* Profile Settings */}
        <Card className="border-none shadow-lg bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><UserX className="w-5 h-5 mr-2 text-[var(--primary)]" /> Profile Settings</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="flex items-center space-x-2">
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter a unique username"
                  className="max-w-md"
                />
                <Button onClick={handleUpdateUsername} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-[var(--foreground)]/60">Your username must be unique. This is how friends can find you.</p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card className="border-none shadow-lg bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><Shield className="w-5 h-5 mr-2 text-[var(--primary)]" /> Privacy Controls</CardTitle>
            <CardDescription>Manage who can see your profile and interact with you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Private Profile</p>
                <p className="text-xs text-[var(--foreground)]/60">Only approved followers can see your posts and photos.</p>
              </div>
              <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer transition-colors duration-200">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Online Status</p>
                <p className="text-xs text-[var(--foreground)]/60">Let others see when you are active.</p>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer transition-colors duration-200">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocking & Reporting */}
        <Card className="border-none shadow-lg bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><UserX className="w-5 h-5 mr-2 text-red-500" /> Blocked Users</CardTitle>
            <CardDescription>Manage users you have blocked. They cannot message or call you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--foreground)]/10 pb-4">
                <div className="flex items-center space-x-3">
                  <img src="https://i.pravatar.cc/150?u=fake1" className="w-10 h-10 rounded-full" />
                  <span className="font-medium">ToxicUser99</span>
                </div>
                <Button variant="outline" size="sm">Unblock</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-none shadow-lg bg-red-500/5 border-red-500/20">
          <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-red-500">Danger Zone</h3>
              <p className="text-xs text-[var(--foreground)]/60">Permanently delete your account or sign out.</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Delete Account</Button>
              <Button onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
