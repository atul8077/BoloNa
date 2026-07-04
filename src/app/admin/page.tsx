"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, DollarSign, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Users", value: "12,345", icon: Users, color: "text-blue-500" },
    { title: "Active Creators", value: "482", icon: Video, color: "text-purple-500" },
    { title: "Today's Revenue", value: "₹45,230", icon: DollarSign, color: "text-green-500" },
    { title: "Active Streams", value: "24", icon: Activity, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
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
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="flex items-center space-x-4">
                    <img src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">New User {i}</p>
                      <p className="text-xs text-gray-500">user{i}@example.com</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">2 mins ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card className="border-none shadow-md dark:bg-[#1E293B]">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                  <div>
                    <p className="font-medium text-sm">Creator Application</p>
                    <p className="text-xs text-[var(--primary)] mt-1 cursor-pointer hover:underline">Review Profile</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">Approve</button>
                    <button className="text-xs bg-red-500/10 text-red-600 px-2 py-1 rounded">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
