"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
// Import Agora (commented out for UI stub until API keys are wired)
// import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

interface VideoCallProps {
  onEndCall: () => void;
  receiverName: string;
}

export function VideoCall({ onEndCall, receiverName }: VideoCallProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white animate-in zoom-in-95 duration-300">
      
      {/* Remote Video Placeholder */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900">
        <img src="https://i.pravatar.cc/500?u=aisha" alt="Remote" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="z-10 text-center">
          <h2 className="text-3xl font-bold">{receiverName}</h2>
          <p className="text-white/70 animate-pulse">00:15</p>
        </div>
      </div>

      {/* Local Video Placeholder (Picture in Picture) */}
      <div className="absolute top-8 right-8 w-32 h-48 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
         {isVideoOff ? (
           <div className="w-full h-full flex items-center justify-center bg-gray-900"><VideoOff className="w-8 h-8 opacity-50" /></div>
         ) : (
           <img src="https://i.pravatar.cc/300?u=me" alt="Local" className="w-full h-full object-cover" />
         )}
      </div>

      {/* Controls */}
      <div className="h-24 bg-gradient-to-t from-black to-transparent flex items-center justify-center space-x-6 pb-6 absolute bottom-0 left-0 right-0">
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full h-14 w-14 border-none ${isMuted ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
        
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
          onClick={onEndCall}
        >
          <PhoneOff className="w-8 h-8" />
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full h-14 w-14 border-none ${isVideoOff ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
          onClick={() => setIsVideoOff(!isVideoOff)}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </Button>
      </div>

    </div>
  );
}
