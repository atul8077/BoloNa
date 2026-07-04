"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";

interface AudioCallProps {
  onEndCall: () => void;
  receiverName: string;
}

export function AudioCall({ onEndCall, receiverName }: AudioCallProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isSpeaker, setIsSpeaker] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white animate-in zoom-in-95 duration-300">
      
      {/* Call Info */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--primary)] rounded-full animate-ping opacity-20" />
          <img src="https://i.pravatar.cc/300?u=aisha" alt={receiverName} className="relative w-40 h-40 rounded-full border-4 border-white/20 object-cover shadow-2xl z-10" />
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2">{receiverName}</h2>
          <p className="text-white/70 text-lg">02:45</p>
        </div>
      </div>

      {/* Controls */}
      <div className="h-32 bg-white/5 backdrop-blur-xl rounded-t-[3rem] flex items-center justify-center space-x-8 px-6 border-t border-white/10">
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full h-16 w-16 border-none ${isSpeaker ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
          onClick={() => setIsSpeaker(!isSpeaker)}
        >
          <Volume2 className="w-6 h-6" />
        </Button>
        
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full h-20 w-20 bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.6)] border-4 border-white/10"
          onClick={onEndCall}
        >
          <PhoneOff className="w-8 h-8" />
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full h-16 w-16 border-none ${isMuted ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
      </div>

    </div>
  );
}
