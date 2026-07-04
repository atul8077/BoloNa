"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  useEffect(() => {
    async function setupPushNotifications() {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Check current subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Subscribe if not already subscribed
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        // Save subscription to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const subJSON = subscription.toJSON();
          await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            endpoint: subJSON.endpoint,
            p256dh: subJSON.keys?.p256dh,
            auth: subJSON.keys?.auth
          }, { onConflict: 'user_id, endpoint' });
        }
      } catch (error) {
        console.error('Service Worker / Push notification error', error);
      }
    }

    setupPushNotifications();
  }, []);

  return null;
}
