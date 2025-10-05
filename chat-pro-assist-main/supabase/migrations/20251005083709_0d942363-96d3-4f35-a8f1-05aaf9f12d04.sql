-- Create enum for app roles (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for call direction
CREATE TYPE public.call_direction AS ENUM ('inbound', 'outbound');

-- Create enum for call status
CREATE TYPE public.call_status AS ENUM ('queued', 'ringing', 'in-progress', 'completed', 'failed', 'missed');

-- Create enum for sentiment
CREATE TYPE public.sentiment_type AS ENUM ('positive', 'neutral', 'negative');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- Create enum for lead priority
CREATE TYPE public.lead_priority AS ENUM ('low', 'medium', 'high');

-- Create enum for lead source
CREATE TYPE public.lead_source AS ENUM ('phone', 'chat', 'email', 'web');

-- Create enum for assistant preset type
CREATE TYPE public.assistant_preset AS ENUM ('sales', 'support', 'appointment', 'survey', 'custom');

-- Update leads table with new columns
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS interest text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS priority public.lead_priority DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS source public.lead_source DEFAULT 'phone',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS tags text[];

-- Create assistants table
CREATE TABLE IF NOT EXISTS public.assistants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vapi_assistant_id text UNIQUE,
  name text NOT NULL,
  description text,
  prompt text,
  voice_provider text,
  voice_id text,
  model text DEFAULT 'gpt-3.5-turbo',
  temperature decimal DEFAULT 0.7,
  first_message text,
  is_active boolean DEFAULT true,
  preset_type public.assistant_preset DEFAULT 'custom',
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create calls table
CREATE TABLE IF NOT EXISTS public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vapi_call_id text UNIQUE,
  phone_number text,
  caller_name text,
  direction public.call_direction,
  status public.call_status DEFAULT 'queued',
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration integer,
  recording_url text,
  transcript text,
  ai_summary text,
  sentiment public.sentiment_type,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  assistant_id text,
  cost decimal,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create call_events table
CREATE TABLE IF NOT EXISTS public.call_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES public.calls(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assistants
CREATE POLICY "Users can view their own assistants"
  ON public.assistants FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own assistants"
  ON public.assistants FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own assistants"
  ON public.assistants FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own assistants"
  ON public.assistants FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for calls
CREATE POLICY "Users can view their own calls"
  ON public.calls FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own calls"
  ON public.calls FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own calls"
  ON public.calls FOR UPDATE
  USING (auth.uid() = owner_id);

-- RLS Policies for call_events
CREATE POLICY "Users can view their own call events"
  ON public.call_events FOR SELECT
  USING (call_id IN (SELECT id FROM public.calls WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their own call events"
  ON public.call_events FOR INSERT
  WITH CHECK (call_id IN (SELECT id FROM public.calls WHERE owner_id = auth.uid()));

-- Update leads table RLS to allow updates
CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (owner_id = auth.uid());

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_assistants_updated_at ON public.assistants;
CREATE TRIGGER update_assistants_updated_at
  BEFORE UPDATE ON public.assistants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_calls_updated_at ON public.calls;
CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_owner_id ON public.calls(owner_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON public.calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_start_time ON public.calls(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_events_call_id ON public.call_events(call_id);
CREATE INDEX IF NOT EXISTS idx_assistants_owner_id ON public.assistants(owner_id);

-- Enable realtime for calls table
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER TABLE public.calls REPLICA IDENTITY FULL;