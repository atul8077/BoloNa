export const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

if (!AGORA_APP_ID) {
  console.warn("Agora App ID is missing! Video calls and real-time messaging will not work. Please add NEXT_PUBLIC_AGORA_APP_ID to your .env.local file.");
}
