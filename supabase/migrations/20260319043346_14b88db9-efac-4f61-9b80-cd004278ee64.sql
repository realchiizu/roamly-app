
-- Profiles table for nickname
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nickname text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add start_date and end_date to trips, migrate existing date column
ALTER TABLE public.trips ADD COLUMN start_date date;
ALTER TABLE public.trips ADD COLUMN end_date date;

UPDATE public.trips SET start_date = date, end_date = date WHERE start_date IS NULL;

ALTER TABLE public.trips ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE public.trips ALTER COLUMN end_date SET NOT NULL;

-- Logistics tables
CREATE TABLE public.trip_logistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('flight', 'hotel', 'booking')),
  flight_number text,
  flight_time text,
  terminal text,
  gate text,
  hotel_name text,
  hotel_address text,
  booking_title text,
  file_url text,
  file_storage_path text,
  notes text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_logistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logistics" ON public.trip_logistics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logistics" ON public.trip_logistics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logistics" ON public.trip_logistics
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logistics" ON public.trip_logistics
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, '');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
