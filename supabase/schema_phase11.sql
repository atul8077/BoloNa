-- Enable realtime replication for messages and call_logs
-- This is critical so that active users can see messages instantly without refreshing the page.

-- Ensure replica identity is set to full so UPDATE and DELETE broadcast the full old record
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.call_logs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;
