"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, Heart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AiMatchPage() {
  const [isScanning, setIsScanning] = React.useState(false);
  const [matchFound, setMatchFound] = React.useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setMatchFound(false);
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsScanning(false);
      setMatchFound(true);
    }, 3500);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center animate-in fade-in">
      
      {!isScanning && !matchFound && (
        <div className="text-center max-w-lg space-y-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[var(--primary)]/40 mb-8">
            <BrainCircuit className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            BoloNa AI Matchmaker
          </h1>
          <p className="text-[var(--foreground)]/70 text-lg">
            Let our advanced Neural Network analyze your interests, personality, and behavior to find your absolute perfect match.
          </p>
          <Button 
            onClick={handleScan}
            className="h-14 px-8 text-lg rounded-full font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-xl shadow-[var(--primary)]/30 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Start AI Analysis
          </Button>
        </div>
      )}

      {isScanning && (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 border-4 border-t-[var(--primary)] border-r-[var(--secondary)] border-b-transparent border-l-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-b-[var(--primary)] border-l-[var(--secondary)] border-t-transparent border-r-transparent rounded-full animate-spin animation-delay-200" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit className="w-12 h-12 text-[var(--primary)] animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold animate-pulse text-[var(--primary)]">Analyzing Compatibility Matrix...</h2>
          <p className="text-[var(--foreground)]/60 text-sm">Processing 2,451 data points</p>
        </div>
      )}

      {matchFound && (
        <div className="w-full max-w-2xl animate-in zoom-in duration-700 text-center">
          <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
            99% Compatibility Match Found!
          </h2>
          
          <Card className="border-none shadow-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
               <div className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                 <Zap className="w-4 h-4 text-white fill-current" />
                 <span className="text-white font-bold text-sm">Top 1% Match</span>
               </div>
            </div>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                
                {/* Users combined */}
                <div className="flex items-center justify-center relative">
                  <img src="https://i.pravatar.cc/300?u=me" className="w-24 h-24 rounded-full border-4 border-white shadow-xl z-10" />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center -mx-4 z-20 shadow-lg">
                    <Heart className="w-6 h-6 text-pink-500 fill-current animate-pulse" />
                  </div>
                  <img src="https://i.pravatar.cc/300?u=soulmate" className="w-24 h-24 rounded-full border-4 border-white shadow-xl z-10" />
                </div>

                <div className="flex-1 text-left space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">Priya Sharma, 24</h3>
                    <p className="text-[var(--foreground)]/60">Mumbai, India</p>
                  </div>
                  
                  <div className="bg-[var(--foreground)]/5 p-3 rounded-xl border border-[var(--foreground)]/10">
                    <p className="text-sm font-medium"><Sparkles className="w-4 h-4 inline mr-1 text-[var(--primary)]" /> AI Insight:</p>
                    <p className="text-xs text-[var(--foreground)]/70 mt-1 italic">
                      "You both share a deep passion for indie music, spontaneous travel, and have highly compatible communication styles during late evenings."
                    </p>
                  </div>

                  <Button className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-pink-500 to-violet-500 border-none text-white shadow-xl shadow-pink-500/30">
                    Say Hello Now
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
          
          <Button variant="ghost" className="mt-6 text-[var(--foreground)]/50 hover:text-[var(--foreground)]" onClick={() => setMatchFound(false)}>
            Scan Again
          </Button>
        </div>
      )}

    </div>
  );
}
