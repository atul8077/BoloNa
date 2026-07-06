"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { AGORA_APP_ID } from "@/lib/agora";
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { 
  AgoraRTCProvider, 
  useRTCClient, 
  useLocalMicrophoneTrack, 
  useLocalCameraTrack, 
  useJoin, 
  usePublish, 
  useRemoteUsers, 
  useRemoteAudioTracks, 
  useRemoteVideoTracks,
  RemoteUser,
  LocalVideoTrack
} from "agora-rtc-react";

interface VideoCallProps {
  onEndCall: () => void;
  receiverName: string;
  channelName: string; // Add channel name
  currentUserId: string;
}

let outRingtone: HTMLAudioElement | null = null;
const playOutRing = () => {
  if (typeof window !== 'undefined') {
    if (!outRingtone) {
      outRingtone = new Audio('/ring.mp3');
      outRingtone.loop = true;
    }
    outRingtone.play().catch(e => console.log('Audio play failed', e));
  }
};
const stopOutRing = () => {
  if (outRingtone) {
    outRingtone.pause();
    outRingtone.currentTime = 0;
  }
};

// Inner component that uses Agora hooks
function VideoCallInner({ onEndCall, receiverName, channelName, currentUserId }: VideoCallProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [joined, setJoined] = React.useState(false);
  const [rtcToken, setRtcToken] = React.useState<string | null>(null);

  // Setup local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { localCameraTrack } = useLocalCameraTrack();
  
  // Get remote users
  const remoteUsers = useRemoteUsers();
  
  // Join the channel automatically once token is available
  useJoin(
    {
      appid: AGORA_APP_ID,
      channel: channelName,
      token: rtcToken,
      uid: null, // Let Agora dynamically assign a numeric UID
    },
    joined
  );

  React.useEffect(() => {
    async function fetchToken() {
      if (!AGORA_APP_ID) return;
      try {
        const res = await fetch(`/api/agora/token?uid=${currentUserId}&channelName=${channelName}&tokenType=rtc`);
        const data = await res.json();
        if (data.token) {
          setRtcToken(data.token);
          setJoined(true);
        } else {
          console.error("Failed to fetch RTC token:", data.error);
        }
      } catch (err) {
        console.error("Error fetching RTC token:", err);
      }
    }
    fetchToken();
  }, [currentUserId, channelName]);

  // Publish tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Handle remote users
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

  React.useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.setMuted(isVideoOff);
    }
  }, [isVideoOff, localCameraTrack]);

  // Handle outgoing ringtone
  React.useEffect(() => {
    if (remoteUsers.length === 0) {
      playOutRing();
    } else {
      stopOutRing();
    }
    return () => stopOutRing();
  }, [remoteUsers.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white animate-in zoom-in-95 duration-300">
      
      {/* Remote Video */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900">
        {remoteUsers.length > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            <RemoteUser user={remoteUsers[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div className="text-center z-10 flex flex-col items-center">
            <div className="w-24 h-24 mb-4 rounded-full bg-gray-700 animate-pulse" />
            <h2 className="text-3xl font-bold mb-2">Calling {receiverName}...</h2>
            <p className="text-white/70">Waiting for them to answer</p>
          </div>
        )}
      </div>

      {/* Local Video Placeholder (Picture in Picture) */}
      <div className="absolute top-8 right-8 w-32 h-48 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
         {isVideoOff ? (
           <div className="w-full h-full flex items-center justify-center bg-gray-900"><VideoOff className="w-8 h-8 opacity-50" /></div>
         ) : (
           localCameraTrack ? (
             <LocalVideoTrack track={localCameraTrack} play={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-gray-900 animate-pulse" />
           )
         )}
      </div>

      {/* Controls */}
      <div className="h-24 bg-gradient-to-t from-black to-transparent flex items-center justify-center space-x-6 pb-6 absolute bottom-0 left-0 right-0 z-20">
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
          onClick={() => { setJoined(false); onEndCall(); }}
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

// Wrapper to provide Agora Client
export function VideoCall(props: VideoCallProps) {
  const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }) as any);

  if (!AGORA_APP_ID) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-xl max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">Agora App ID Missing</h2>
          <p className="mb-6">Please add NEXT_PUBLIC_AGORA_APP_ID to your .env.local file to enable Video Calls.</p>
          <Button onClick={props.onEndCall}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallInner {...props} />
    </AgoraRTCProvider>
  );
}
