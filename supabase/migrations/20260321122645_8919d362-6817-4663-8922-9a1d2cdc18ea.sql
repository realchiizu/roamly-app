
-- Add share_id to trips for public sharing
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS share_id uuid UNIQUE DEFAULT gen_random_uuid();

-- Allow anonymous users to read trips by share_id
CREATE POLICY "Anyone can view shared trips"
ON public.trips
FOR SELECT
TO anon
USING (share_id IS NOT NULL);

-- Allow anonymous users to read itinerary items for shared trips
CREATE POLICY "Anyone can view itinerary of shared trips"
ON public.itinerary_items
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = itinerary_items.trip_id
    AND trips.share_id IS NOT NULL
  )
);

-- Allow anonymous users to read photos for shared trips
CREATE POLICY "Anyone can view photos of shared trips"
ON public.trip_photos
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = trip_photos.trip_id
    AND trips.share_id IS NOT NULL
  )
);
