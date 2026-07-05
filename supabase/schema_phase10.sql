-- Enable the pg_cron extension (often enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a job to run every hour at minute 0
-- This job deletes all messages that were created more than 2 hours ago.
SELECT cron.schedule(
  'delete_old_messages_job',
  '0 * * * *', 
  $$ DELETE FROM public.messages WHERE created_at < NOW() - INTERVAL '2 hours'; $$
);

-- Note: If you want to manually run the cleanup right now to test, you can run:
-- DELETE FROM public.messages WHERE created_at < NOW() - INTERVAL '2 hours';
