-- Create or modify trip_activities table

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.trip_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add new columns if they don't exist
ALTER TABLE public.trip_activities
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS entity_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Migrate data from legacy columns (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_activities' AND column_name='action_type') THEN
    UPDATE public.trip_activities
    SET type = action_type
    WHERE type IS NULL AND action_type IS NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_activities' AND column_name='user_id') THEN
    UPDATE public.trip_activities
    SET actor_id = user_id
    WHERE actor_id IS NULL AND user_id IS NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trip_activities' AND column_name='details') THEN
    UPDATE public.trip_activities
    SET metadata = details
    WHERE (metadata IS NULL OR metadata = '{}'::jsonb) AND details IS NOT NULL;
  END IF;
END $$;

-- RLS Policies
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;

-- Allow members of the trip to view activities
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'trip_activities' 
      AND policyname = 'Trip members can view activities'
  ) THEN
      CREATE POLICY "Trip members can view activities" 
      ON public.trip_activities FOR SELECT 
      USING (
          EXISTS (
              SELECT 1 FROM public.trip_members
              WHERE trip_members.trip_id = trip_activities.trip_id
              AND trip_members.user_id = auth.uid()
          )
      );
  END IF;

  IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'trip_activities' 
      AND policyname = 'Trip members can insert activities'
  ) THEN
      CREATE POLICY "Trip members can insert activities" 
      ON public.trip_activities FOR INSERT 
      WITH CHECK (
          EXISTS (
              SELECT 1 FROM public.trip_members
              WHERE trip_members.trip_id = trip_activities.trip_id
              AND trip_members.user_id = auth.uid()
          )
      );
  END IF;
END $$;
