"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Star } from "lucide-react";
import Link from "next/link";

// Mock Data for Premium Feel
const mockStories = [
  { id: 1, name: "Aisha", image: "https://i.pravatar.cc/150?u=aisha" },
  { id: 2, name: "Rahul", image: "https://i.pravatar.cc/150?u=rahul" },
  { id: 3, name: "Priya", image: "https://i.pravatar.cc/150?u=priya" },
  { id: 4, name: "Vikram", image: "https://i.pravatar.cc/150?u=vikram" },
  { id: 5, name: "Neha", image: "https://i.pravatar.cc/150?u=neha" },
];

const mockRecommendations = [
  { id: 1, name: "Sneha Sharma", age: 24, city: "Mumbai", image: "https://i.pravatar.cc/300?u=sneha", match: 98 },
  { id: 2, name: "Arjun Reddy", age: 27, city: "Delhi", image: "https://i.pravatar.cc/300?u=arjun", match: 94 },
  { id: 3, name: "Kavya Singh", age: 23, city: "Bangalore", image: "https://i.pravatar.cc/300?u=kavya", match: 89 },
];

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stories Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Stories</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] p-[2px]">
              <div className="h-full w-full rounded-full border-2 border-[var(--background)] bg-[var(--background)] flex items-center justify-center">
                <span className="text-2xl font-bold text-[var(--foreground)]/50">+</span>
              </div>
            </div>
            <span className="text-xs font-medium">Add Story</span>
          </div>
          {mockStories.map(story => (
            <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer hover:opacity-80 transition">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] p-[2px]">
                <img src={story.image} alt={story.name} className="h-full w-full rounded-full border-2 border-[var(--background)] object-cover" />
              </div>
              <span className="text-xs font-medium">{story.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Profiles */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Top Recommendations</h2>
          <Link href="/discovery">
            <Button variant="link">See All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRecommendations.map(profile => (
            <Card key={profile.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white/50 dark:bg-white/5 backdrop-blur-md">
              <div className="relative h-64 w-full overflow-hidden">
                <img src={profile.image} alt={profile.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{profile.match}% Match</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{profile.name}, {profile.age}</h3>
                  <p className="text-sm opacity-90">{profile.city}</p>
                </div>
              </div>
              <CardContent className="p-4 flex justify-between">
                <Button variant="outline" className="w-[45%] rounded-full border-gray-300 dark:border-gray-700 hover:text-[var(--danger)] hover:border-[var(--danger)]">
                  <Heart className="w-5 h-5 mr-2" /> Skip
                </Button>
                <Button className="w-[45%] rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] border-none">
                  <MessageSquare className="w-5 h-5 mr-2" /> Say Hi
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Wallet Promo Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-[#312E81] p-8 text-white shadow-xl">
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
