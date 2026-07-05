import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Initialize web-push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Initialize Supabase Admin client to fetch subscriptions securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
// Note: Normally you'd use SERVICE_ROLE_KEY in an API route to bypass RLS, 
// but we'll use ANON_KEY fallback if user hasn't provided it, though RLS might block it.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: Request) {
  try {
    const { receiverId, payload } = await req.json();

    if (!receiverId || !payload) {
      return NextResponse.json({ error: 'Missing receiverId or payload' }, { status: 400 });
    }

    if (!process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Push notifications are not configured (Missing VAPID keys)' }, { status: 501 });
    }

    // Fetch user's push subscriptions from the database
    // We bypass RLS by using service role key, or if anon key, hope RLS allows reading.
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', receiverId);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'User has no registered devices' }, { status: 200 });
    }

    // Send push notification to all of the user's devices
    const sendPromises = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      return webpush.sendNotification(pushSubscription, JSON.stringify(payload)).catch((err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription has expired or is no longer valid, delete it from DB
          return supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.error('Error sending push notification:', err);
        }
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: 'Notifications sent' }, { status: 200 });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
