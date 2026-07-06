import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtmTokenBuilder, RtcRole } from 'agora-token';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const channelName = searchParams.get('channelName');
  const tokenType = searchParams.get('tokenType'); // 'rtc' or 'rtm'

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return NextResponse.json({ error: 'Agora App ID or Certificate is missing from environment variables' }, { status: 500 });
  }

  if (!uid) {
    return NextResponse.json({ error: 'uid is required' }, { status: 400 });
  }

  // Token expires in 24 hours
  const expirationTimeInSeconds = 3600 * 24;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    if (tokenType === 'rtm') {
      // Generate RTM Token (String User ID)
      const token = RtmTokenBuilder.buildToken(appId, appCertificate, uid, privilegeExpiredTs);
      return NextResponse.json({ token });
    } 
    else if (tokenType === 'rtc') {
      if (!channelName) {
        return NextResponse.json({ error: 'channelName is required for RTC token' }, { status: 400 });
      }
      
      // For RTC, to avoid String UID mismatch errors, we generate a wildcard token using uid = 0.
      // This allows the frontend to join with a dynamically assigned numeric UID.
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        0,
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
        privilegeExpiredTs
      );
      
      return NextResponse.json({ token });
    } 
    else {
      return NextResponse.json({ error: 'Invalid tokenType. Must be rtc or rtm' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
