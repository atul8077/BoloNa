"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, DollarSign, Users, Activity, PlayCircle } from "lucide-react";

export default function CreatorDashboardPage() {
  const stats = [
    { title: "Today's Earnings", value: "₹2,450", icon: DollarSign, color: "text-green-500" },
    { title: "Total Followers", value: "14.2K", icon: Users, color: "text-blue-500" },
    { title: "Call Minutes", value: "324", icon: Video, color: "text-purple-500" },
    { title: "Performance Score", value: "98/100", icon: Activity, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
          <p className="text-[var(--foreground)]/60 text-sm mt-1">Manage your content, earnings, and audience.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-full border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10">
            Withdraw Funds
          </Button>
          <Button className="rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 border-none">
            <PlayCircle className="w-5 h-5 mr-2" />
            Go Live Now
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-none shadow-xl bg-white/50 dark:bg-white/5 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-white dark:bg-[#0F172A] shadow-sm ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="text-sm font-medium text-[var(--foreground)]/60 mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings Chart Placeholder */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-white/50 dark:bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--foreground)]/10 rounded-xl">
              <p className="text-[var(--foreground)]/50 font-medium">Earnings Chart Visualization</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Settings */}
        <div className="space-y-6">
          
          <Card className="border-none shadow-xl bg-white/50 dark:bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Call Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Availability</span>
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold">Available</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Audio Call Price</span>
                <span className="font-bold">50 <span className="text-xs text-[var(--foreground)]/50">coins/min</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Video Call Price</span>
                <span className="font-bold">100 <span className="text-xs text-[var(--foreground)]/50">coins/min</span></span>
              </div>
              <Button variant="outline" className="w-full mt-2">Edit Pricing</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Creator Tips</h3>
              <p className="text-sm text-white/80 mb-4">
                Host a live stream today to increase your profile visibility by 300% and earn more gifts!
              </p>
              <Button className="w-full bg-white text-[var(--primary)] hover:bg-gray-100 rounded-full font-bold">
                Learn More
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
