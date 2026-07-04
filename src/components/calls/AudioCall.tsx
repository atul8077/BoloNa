"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { AGORA_APP_ID } from "@/lib/agora";
import AgoraRTC from "agora-rtc-sdk-ng";
import { 
  AgoraRTCProvider, 
  useRTCClient, 
  useLocalMicrophoneTrack, 
  useJoin, 
  usePublish, 
  useRemoteUsers, 
  useRemoteAudioTracks
} from "agora-rtc-react";

interface AudioCallProps {
  onEndCall: () => void;
  receiverName: string;
  channelName: string;
}

function AudioCallInner({ onEndCall, receiverName, channelName }: AudioCallProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isSpeaker, setIsSpeaker] = React.useState(false);
  const [joined, setJoined] = React.useState(false);

  // Setup local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();
  
  // Join the channel automatically
  useJoin(
    {
      appid: AGORA_APP_ID,
      channel: channelName,
      token: null, // Test without token
      uid: null,
    },
    joined
  );

  React.useEffect(() => {
    if (AGORA_APP_ID) {
      setJoined(true);
    }
  }, []);

  // Publish tracks
  usePublish([localMicrophoneTrack]);

  // Handle remote users
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  
  // Play remote audio
  React.useEffect(() => {
    audioTracks.map((track) => track.play());
  }, [audioTracks]);

  // Handle mute/unmute
  React.useEffect(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setMuted(isMuted);
    }
  }, [isMuted, localMicrophoneTrack]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white animate-in zoom-in-95 duration-300">
      
      {/* Call Info */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--primary)] rounded-full animate-ping opacity-20" />
          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${receiverName}`} alt={receiverName} className="relative w-40 h-40 rounded-full border-4 border-white/20 object-cover shadow-2xl z-10 bg-gray-800" />
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2">{receiverName}</h2>
          <p className="text-white/70 text-lg">
            {remoteUsers.length > 0 ? "Connected" : "Ringing..."}
          </p>
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
          onClick={() => { setJoined(false); onEndCall(); }}
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

// Wrapper to provide Agora Client
export function AudioCall(props: AudioCallProps) {
  const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));

  if (!AGORA_APP_ID) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-xl max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">Agora App ID Missing</h2>
          <p className="mb-6">Please add NEXT_PUBLIC_AGORA_APP_ID to your .env.local file to enable Audio Calls.</p>
          <Button onClick={props.onEndCall}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <AgoraRTCProvider client={client}>
      <AudioCallInner {...props} />
    </AgoraRTCProvider>
  );
}
