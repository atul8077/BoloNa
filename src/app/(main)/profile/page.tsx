"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Edit3, Grid, Info, MapPin, Briefcase, GraduationCap, Heart } from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState<'posts' | 'about'>('posts');

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in pb-20">
      
      {/* Cover & Avatar */}
      <div className="relative h-64 md:h-80 w-full rounded-b-3xl overflow-hidden shadow-2xl">
        <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=2574&auto=format&fit=crop" alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link href="/settings">
            <Button variant="outline" size="icon" className="bg-black/20 border-none text-white hover:bg-white/20 backdrop-blur-md rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative px-4 sm:px-8 -mt-20 flex flex-col md:flex-row items-center md:items-end justify-between">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 w-full">
          {/* Avatar */}
          <div className="relative">
            <img src="https://i.pravatar.cc/300?u=me" alt="Avatar" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--background)] object-cover shadow-2xl" />
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-[var(--background)] shadow-sm" />
          </div>

          {/* Profile Info */}
          <div className="text-center md:text-left mb-2 flex-1">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Aarav Patel</h1>
            <p className="text-[var(--primary)] font-semibold mt-1">@aarav_p</p>
            <p className="text-[var(--foreground)]/70 text-sm max-w-md mt-2">
              Explorer of the world 🌍 | Tech enthusiast 💻 | Coffee lover ☕ | Always up for an adventure.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mb-2 shrink-0">
            <Link href="/profile/edit">
              <Button className="rounded-full font-bold bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] border-none shadow-none">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </Link>
            <Link href="/premium">
              <Button className="rounded-full font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none shadow-xl shadow-orange-500/20">
                Premium
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center md:justify-start space-x-8 px-4 sm:px-8 mt-8 pb-8 border-b border-[var(--foreground)]/10">
        <div className="text-center">
          <p className="text-2xl font-bold">142</p>
          <p className="text-xs text-[var(--foreground)]/60 font-medium uppercase tracking-wider">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">12.5K</p>
          <p className="text-xs text-[var(--foreground)]/60 font-medium uppercase tracking-wider">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">450</p>
          <p className="text-xs text-[var(--foreground)]/60 font-medium uppercase tracking-wider">Following</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-12 mt-6 mb-6">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex items-center space-x-2 pb-2 border-b-2 font-medium transition-colors ${activeTab === 'posts' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}
        >
          <Grid className="w-5 h-5" /> <span>Photos</span>
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`flex items-center space-x-2 pb-2 border-b-2 font-medium transition-colors ${activeTab === 'about' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}
        >
          <Info className="w-5 h-5" /> <span>About</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-8">
        
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer group">
                <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=500&q=80`} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4">
            <Card className="border-none shadow-md bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Location</p>
                    <p className="font-semibold text-lg">Mumbai, India</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><Briefcase className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Occupation</p>
                    <p className="font-semibold text-lg">Software Architect</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><GraduationCap className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Education</p>
                    <p className="font-semibold text-lg">IIT Bombay</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"><Heart className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/60">Relationship Status</p>
                    <p className="font-semibold text-lg">Single</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}
