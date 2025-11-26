-- Migration: create group_messages table to persist chat messages inside groups
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text','code','system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON public.group_messages(user_id);
