-- ============================================================
-- Dinner with... — Supabase Manual Setup SQL
-- Paste this entire file into Supabase Dashboard → SQL Editor
-- ============================================================

-- STEP 1: Schema + RLS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text CHECK (role IN ('host', 'guest')),
  avatar_url text,
  bio text CHECK (char_length(bio) <= 200),
  lat numeric(10,8),
  lng numeric(11,8),
  city text,
  state text,
  profile_completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  lat numeric(10,8),
  lng numeric(11,8),
  category text,
  is_sit_down boolean DEFAULT true,
  source text CHECK (source IN ('seeded', 'google_places')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id uuid REFERENCES auth.users NOT NULL,
  guest_user_id uuid REFERENCES auth.users NOT NULL,
  restaurant_id uuid REFERENCES public.restaurants,
  proposed_time timestamp with time zone,
  status text CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
  message text CHECK (char_length(message) <= 300),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.safety_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id uuid REFERENCES auth.users NOT NULL,
  reported_user_id uuid REFERENCES auth.users NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

-- Drop policies first so re-runs are safe
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Restaurants viewable by all" ON public.restaurants;
DROP POLICY IF EXISTS "Invitations viewable by participants" ON public.invitations;
DROP POLICY IF EXISTS "Users create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users update invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can report" ON public.safety_reports;

CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Restaurants viewable by all" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Invitations viewable by participants" ON public.invitations FOR SELECT USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id);
CREATE POLICY "Users create invitations" ON public.invitations FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "Users update invitations" ON public.invitations FOR UPDATE USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id);
CREATE POLICY "Users can report" ON public.safety_reports FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);


-- STEP 2: Seed Restaurants
-- ============================================================

INSERT INTO public.restaurants (id, name, address, lat, lng, category, is_sit_down, source) VALUES
  ('8a70db8a-2dd5-4d5b-8d99-071daf4f3c2d', 'Harvest Table',     '112 W Main St',       45.52340000, -122.67620000, 'Farm-to-table',   true, 'seeded'),
  ('5c9e6daf-54d3-4a43-9cde-6394fd1d2b68', 'Lakeview Bistro',   '57 Lakeshore Blvd',   45.51070000, -122.66080000, 'Contemporary',    true, 'seeded'),
  ('64efef7c-ff19-4ca9-85c3-58784f1ca8b1', 'Pine Street Diner', '720 Pine St',         45.51540000, -122.67840000, 'Classic American', true, 'seeded'),
  ('f4a4a83c-3532-44a2-b7fb-9dd5ee6f83e8', 'Northstar Table',   '980 NW Couch St',     45.52310000, -122.68190000, 'New American',    true, 'seeded'),
  ('0f4d2c67-35f7-4c38-bc8e-3d3a6b5c5234', 'Harbor House',      '201 SW Harbor Way',   45.50680000, -122.67500000, 'Seafood',         true, 'seeded'),
  (gen_random_uuid(), 'Olive & Vine',       '340 SE Morrison St',  45.51800000, -122.66100000, 'Mediterranean',   true, 'seeded'),
  (gen_random_uuid(), 'The Copper Pot',     '88 NE Alberta St',    45.55950000, -122.64830000, 'Comfort Food',    true, 'seeded'),
  (gen_random_uuid(), 'Sakura Garden',      '1200 SW 5th Ave',     45.51600000, -122.67900000, 'Japanese',        true, 'seeded'),
  (gen_random_uuid(), 'El Rancho',          '450 SE Hawthorne Blvd', 45.51200000, -122.64500000, 'Mexican',        true, 'seeded'),
  (gen_random_uuid(), 'The Grand Elm',      '620 NW 23rd Ave',     45.52900000, -122.69700000, 'Gastropub',       true, 'seeded'),
  (gen_random_uuid(), 'Saffron House',      '210 NE Broadway',     45.53700000, -122.65800000, 'Indian',          true, 'seeded'),
  (gen_random_uuid(), 'Riverfront Grill',   '10 SW Naito Pkwy',    45.51000000, -122.67100000, 'American',        true, 'seeded'),
  (gen_random_uuid(), 'Blue Willow',        '955 NW Glisan St',    45.52500000, -122.68500000, 'Asian Fusion',    true, 'seeded'),
  (gen_random_uuid(), 'Pearl Brasserie',    '900 NW Lovejoy St',   45.52800000, -122.68300000, 'French',          true, 'seeded'),
  (gen_random_uuid(), 'Portside Kitchen',   '301 SW Montgomery St',45.50500000, -122.67600000, 'Contemporary',    true, 'seeded'),
  (gen_random_uuid(), 'Trattoria Roma',     '115 SE Grand Ave',    45.52000000, -122.66000000, 'Italian',         true, 'seeded'),
  (gen_random_uuid(), 'Cider House',        '1802 NE Alberta St',  45.55990000, -122.63700000, 'American',        true, 'seeded'),
  (gen_random_uuid(), 'Sunrise Cafe',       '3201 SE Division St', 45.50500000, -122.63200000, 'Brunch',          true, 'seeded'),
  (gen_random_uuid(), 'The Loft Table',     '475 SW Broadway',     45.51850000, -122.67750000, 'Modern American', true, 'seeded'),
  (gen_random_uuid(), 'Mint Leaf',          '88 SE 28th Ave',      45.51500000, -122.63800000, 'Vegetarian',      true, 'seeded')
ON CONFLICT (id) DO NOTHING;


-- STEP 3: Demo Profiles + Invitations
-- ============================================================
-- PREREQ: Create two auth users first via Dashboard → Authentication → Add User:
--   demohost@dinnerwith.app  / demo123456
--   demoguest@dinnerwith.app / demo123456
-- Then replace the two UUIDs below with their actual IDs.
-- The host created via API already exists: 477bae11-bfbf-4158-a9f9-167601396709

DO $$
DECLARE
  host_id  uuid := '477bae11-bfbf-4158-a9f9-167601396709'; -- demohost@dinnerwith.app (already created)
  guest_id uuid := 'REPLACE_WITH_GUEST_UUID';               -- demoguest@dinnerwith.app — set this after creating the user
  now_ts   timestamptz := now();
BEGIN

  INSERT INTO public.profiles (id, name, email, role, city, state, lat, lng, bio, profile_completed_at, created_at)
  VALUES
    (host_id,  'Mara Jennings', 'demohost@dinnerwith.app',  'host',  'Portland', 'OR', 45.52340000, -122.67620000, 'Weekend chef inviting neighbors to share a table.', now_ts, now_ts),
    (guest_id, 'Calvin Ortiz',  'demoguest@dinnerwith.app', 'guest', 'Portland', 'OR', 45.51540000, -122.67610000, 'Enjoys conversation over small plates.',             now_ts, now_ts)
  ON CONFLICT (id) DO UPDATE
    SET name=EXCLUDED.name, city=EXCLUDED.city, state=EXCLUDED.state,
        lat=EXCLUDED.lat, lng=EXCLUDED.lng, bio=EXCLUDED.bio,
        profile_completed_at=EXCLUDED.profile_completed_at;

  INSERT INTO public.invitations (id, host_user_id, guest_user_id, restaurant_id, status, message, created_at)
  VALUES
    ('e2c7ad4a-5fb1-4c67-92f9-8a5e1cbcca31', host_id, guest_id, '8a70db8a-2dd5-4d5b-8d99-071daf4f3c2d', 'pending',  'Would love to share my favorite seafood meal with you.', now_ts),
    ('39ce8cb3-6753-4c61-9dab-db37c92f4d4d', host_id, guest_id, '5c9e6daf-54d3-4a43-9cde-6394fd1d2b68', 'accepted', 'Let''s celebrate the weekend over dinner.',              now_ts),
    ('a4c74e6b-1a5c-4f79-b13b-3930d0d1df0f', host_id, guest_id, '64efef7c-ff19-4ca9-85c3-58784f1ca8b1', 'declined', 'Maybe next week? I''m full this evening.',              now_ts)
  ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, message=EXCLUDED.message;

  INSERT INTO public.safety_reports (reporter_user_id, reported_user_id, reason, created_at)
  VALUES (guest_id, host_id, 'Concerned about uninvited guests', now_ts);

END $$;
