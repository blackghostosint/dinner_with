import argparse
import datetime
import os
import textwrap
import uuid

import psycopg


SCHEMA_STATEMENTS = [
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
    textwrap.dedent(
        """
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
        """,
    ),
    textwrap.dedent(
        """
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
        """,
    ),
    textwrap.dedent(
        """
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
        """,
    ),
    textwrap.dedent(
        """
        CREATE TABLE IF NOT EXISTS public.safety_reports (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          reporter_user_id uuid REFERENCES auth.users NOT NULL,
          reported_user_id uuid REFERENCES auth.users NOT NULL,
          reason text NOT NULL,
          created_at timestamp with time zone DEFAULT now()
        );
        """,
    ),
    "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;",
    textwrap.dedent(
        """
        CREATE POLICY IF NOT EXISTS \"Profiles viewable by all\"
          ON public.profiles FOR SELECT USING (true);
        """,
    ),
    textwrap.dedent(
        """
        CREATE POLICY IF NOT EXISTS \"Users update own profile\"
          ON public.profiles FOR UPDATE USING (auth.uid() = id);
        """,
    ),
    textwrap.dedent(
        """
        CREATE POLICY IF NOT EXISTS \"Restaurants viewable by all\"
          ON public.restaurants FOR SELECT USING (true);
        """,
    ),
    textwrap.dedent(
        """
        CREATE POLICY IF NOT EXISTS \"Invitations viewable by participants\"
          ON public.invitations FOR SELECT USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id);
        """,
    ),
    textwrap.dedent(
        """
        CREATE POLICY IF NOT EXISTS \"Users create invitations\"
          ON public.invitations FOR INSERT WITH CHECK (auth.uid() = host_user_id);
        """,
    ),
    textwrap.dedent(
        """
        CREATE POLICY IF NOT EXISTS \"Users update invitations\"
          ON public.invitations FOR UPDATE USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id);
        """,
    ),
    textwrap.dedent(
        """
        CREATE POLICY IF NOT EXISTS \"Users can report\"
          ON public.safety_reports FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);
        """,
    ),
]

RESTaurants = [
    {
        "id": "8a70db8a-2dd5-4d5b-8d99-071daf4f3c2d",
        "name": "Harvest Table",
        "address": "112 W Main St",
        "lat": 45.5234,
        "lng": -122.6762,
        "category": "Farm-to-table",
        "is_sit_down": True,
    },
    {
        "id": "5c9e6daf-54d3-4a43-9cde-6394fd1d2b68",
        "name": "Lakeview Bistro",
        "address": "57 Lakeshore Blvd",
        "lat": 45.5107,
        "lng": -122.6608,
        "category": "Contemporary",
        "is_sit_down": True,
    },
    {
        "id": "64efef7c-ff19-4ca9-85c3-58784f1ca8b1",
        "name": "Pine Street Diner",
        "address": "720 Pine St",
        "lat": 45.5154,
        "lng": -122.6784,
        "category": "Classic American",
        "is_sit_down": True,
    },
    {
        "id": "f4a4a83c-3532-44a2-b7fb-9dd5ee6f83e8",
        "name": "Northstar Table",
        "address": "980 NW Couch St",
        "lat": 45.5231,
        "lng": -122.6819,
        "category": "New American",
        "is_sit_down": True,
    },
    {
        "id": "0f4d2c67-35f7-4c38-bc8e-3d3a6b5c5234",
        "name": "Harbor House",
        "address": "201 SW Harbor Way",
        "lat": 45.5068,
        "lng": -122.6750,
        "category": "Seafood",
        "is_sit_down": True,
    },
]

def apply_schema(conn):
    with conn.cursor() as cur:
        for statement in SCHEMA_STATEMENTS:
            cur.execute(statement)


def seed_restaurants(conn):
    with conn.cursor() as cur:
        for restaurant in RESTaurants:
            cur.execute(
                \"\"\"INSERT INTO public.restaurants (id, name, address, lat, lng, category, is_sit_down, source)
                VALUES (%(id)s, %(name)s, %(address)s, %(lat)s, %(lng)s, %(category)s, %(is_sit_down)s, 'seeded')
                ON CONFLICT (id) DO NOTHING;
                \"\"\",
                restaurant,
            )


def seed_demo_profiles(conn, host_ids, guest_ids):
    now = datetime.datetime.utcnow().isoformat()
    templates = [
        {
            "name": "Mara Jennings",
            "role": "host",
            "city": "Portland",
            "state": "OR",
            "lat": 45.5234,
            "lng": -122.6762,
            "bio": "Weekend chef inviting neighbors to share a table.",
        },
        {
            "name": "Calvin Ortiz",
            "role": "guest",
            "city": "Portland",
            "state": "OR",
            "lat": 45.5154,
            "lng": -122.6761,
            "bio": "Enjoys conversation over small plates.",
        },
    ]
    with conn.cursor() as cur:
        for idx, user_id in enumerate(host_ids):
            template = templates[0]
            cur.execute(
                \"\"\"INSERT INTO public.profiles (id, name, email, role, city, state, lat, lng, bio, profile_completed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, city=EXCLUDED.city, state=EXCLUDED.state, lat=EXCLUDED.lat, lng=EXCLUDED.lng, bio=EXCLUDED.bio, profile_completed_at=EXCLUDED.profile_completed_at;
                \"\"\",
                (user_id, template["name"], f\"host{idx+1}@dinnerwith.com\", template["role"], template["city"], template["state"], template["lat"], template["lng"], template["bio"], now),
            )
        for idx, user_id in enumerate(guest_ids):
            template = templates[1]
            cur.execute(
                \"\"\"INSERT INTO public.profiles (id, name, email, role, city, state, lat, lng, bio, profile_completed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, city=EXCLUDED.city, state=EXCLUDED.state, lat=EXCLUDED.lat, lng=EXCLUDED.lng, bio=EXCLUDED.bio, profile_completed_at=EXCLUDED.profile_completed_at;
                \"\"\",
                (user_id, template["name"], f\"guest{idx+1}@dinnerwith.com\", template["role"], template["city"], template["state"], template["lat"], template["lng"], template["bio"], now),
            )


def seed_demo_invitations(conn, host_ids, guest_ids):
    entries = [
        {
            "id": uuid.UUID("e2c7ad4a-5fb1-4c67-92f9-8a5e1cbcca31"),
            "host": host_ids[0],
            "guest": guest_ids[0],
            "restaurant_id": RESTaurants[0]["id"],
            "status": "pending",
            "message": "Would love to share my favorite seafood meal with you.",
        },
        {
            "id": uuid.UUID("39ce8cb3-6753-4c61-9dab-db37c92f4d4d"),
            "host": host_ids[0],
            "guest": guest_ids[1] if len(guest_ids) > 1 else guest_ids[0],
            "restaurant_id": RESTaurants[1]["id"],
            "status": "accepted",
            "message": "Let's celebrate the weekend over dinner.",
        },
        {
            "id": uuid.UUID("a4c74e6b-1a5c-4f79-b13b-3930d0d1df0f"),
            "host": host_ids[1] if len(host_ids) > 1 else host_ids[0],
            "guest": guest_ids[0],
            "restaurant_id": RESTaurants[2]["id"],
            "status": "declined",
            "message": "Maybe next week? I'm full this evening.",
        },
    ]
    now = datetime.datetime.utcnow().isoformat()
    with conn.cursor() as cur:
        for entry in entries:
            cur.execute(
                \"\"\"INSERT INTO public.invitations (id, host_user_id, guest_user_id, restaurant_id, status, message, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, message=EXCLUDED.message;
                \"\"\",
                (
                    entry["id"],
                    entry["host"],
                    entry["guest"],
                    entry["restaurant_id"],
                    entry["status"],
                    entry["message"],
                    now,
                ),
            )


def seed_safety_reports(conn, reporter_id, reported_id):
    now = datetime.datetime.utcnow().isoformat()
    with conn.cursor() as cur:
        cur.execute(
            \"\"\"INSERT INTO public.safety_reports (reporter_user_id, reported_user_id, reason, created_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
            \"\"\",
            (reporter_id, reported_id, 'Concerned about uninvited guests', now),
        )


def main():
    parser = argparse.ArgumentParser(description='Apply Supabase schema and optional demo seeds')
    parser.add_argument(
        '--connection',
        help='Postgres connection string (fallback to SUPABASE_DB_URL env)',
        default=os.environ.get('SUPABASE_DB_URL'),
    )
    parser.add_argument(
        '--connection-file',
        help='File that contains the connection string',
        type=argparse.FileType('r', encoding='utf-8'),
    )
    parser.add_argument('--skip-schema', action='store_true', help='Skip applying the schema DDL')
    parser.add_argument('--seed-restaurants', action='store_true', help='Seed the sample restaurant rows')
    parser.add_argument('--seed-demo', action='store_true', help='Seed demo profiles/invitations (requires host/guest IDs)')
    parser.add_argument(
        '--host-ids',
        nargs='+',
        help='List of host user UUIDs for demo seeds',
    )
    parser.add_argument(
        '--guest-ids',
        nargs='+',
        help='List of guest user UUIDs for demo seeds',
    )
    parser.add_argument(
        '--safety-report',
        nargs=2,
        metavar=('REPORTER_ID', 'REPORTED_ID'),
        help='Create a safety report between two user IDs when --seed-demo is used',
    )
    args = parser.parse_args()

    conn_string = args.connection
    if args.connection_file:
        conn_string = args.connection_file.read().strip()

    if not conn_string:
        raise SystemExit('Please supply SUPABASE_DB_URL env or --connection/--connection-file')

    with psycopg.connect(conn_string) as conn:
        if not args.skip_schema:
            print('Applying schema...')
            apply_schema(conn)
        if args.seed_restaurants:
            print('Seeding restaurants...')
            seed_restaurants(conn)
        if args.seed_demo:
            if not (args.host_ids and args.guest_ids):
                raise SystemExit('--seed-demo requires host IDs and guest IDs')
            print('Seeding profiles/invitations...')
            seed_demo_profiles(conn, args.host_ids, args.guest_ids)
            seed_demo_invitations(conn, args.host_ids, args.guest_ids)
            if args.safety_report:
                print('Seeding safety report...')
                seed_safety_reports(conn, args.safety_report[0], args.safety_report[1])


if __name__ == '__main__':
    main()
