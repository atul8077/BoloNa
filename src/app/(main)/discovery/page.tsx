"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlidersHorizontal, MapPin, Search } from "lucide-react";

export default function DiscoveryPage() {
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discovery</h1>
          <p className="text-[var(--foreground)]/60 text-sm">Find your perfect match</p>
        </div>
        
        <div className="flex w-full md:w-96 space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50" />
            <Input className="pl-9 bg-white/50 dark:bg-white/5 border-none" placeholder="Search by name or username" />
          </div>
          <Button variant="outline" className="shrink-0 bg-white/50 dark:bg-white/5 border-none">
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters (Mock layout) */}
      <Card className="border-none bg-white/30 dark:bg-white/5 backdrop-blur-md p-1">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <select className="h-9 rounded-md border-none bg-white/50 dark:bg-[#0F172A]/50 px-3 text-sm focus:outline-none">
            <option>Gender: All</option>
            <option>Female</option>
            <option>Male</option>
          </select>
          <select className="h-9 rounded-md border-none bg-white/50 dark:bg-[#0F172A]/50 px-3 text-sm focus:outline-none">
            <option>Age: 18-25</option>
            <option>26-35</option>
            <option>35+</option>
          </select>
          <select className="h-9 rounded-md border-none bg-white/50 dark:bg-[#0F172A]/50 px-3 text-sm focus:outline-none">
            <option>Distance: Up to 50km</option>
            <option>Global</option>
          </select>
          <Button variant="ghost" className="h-9 text-[var(--primary)] text-sm ml-auto">
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Discovery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300">
            <img 
              src={`https://i.pravatar.cc/300?img=${(i % 70) + 1}`} 
              alt="Profile" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Online</span>
              </div>
              <h3 className="font-bold text-lg leading-tight">User Name, {20 + i}</h3>
              <div className="flex items-center text-xs opacity-80 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                New Delhi
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
