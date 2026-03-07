---
id: TASK-010-V4
title: Dinner with... app — V4 React/Vite Vibe-Code Spec
status: next
created: 2026-03-06T19:15:00-05:00
scheduled:
due: 2026-03-08T12:00:00-05:00
project: TASK-010
tags: [task, project, spec, hackathon, react, vite, supabase, pwa]
---

# Dinner with... — V4 React/Vite Vibe-Code Ready Spec

## Parent Notes
- [[TASK-010 Dinner with app project]]
- [[TASK-010 Dinner with app project - V3 Vibe-Code Spec]]
- [[TASK-004 Hackathon competition March 2026]]

---

## Objective
Build a hackathon MVP called **Dinner with...** that connects hosts and guests for sit-down meals at nearby restaurants. Social connection — not dating.

## Success Criteria (Hackathon)
1. User can sign up / log in
2. User chooses role: Host or Guest
3. User creates profile with location (HTML5 geolocation)
4. User sees nearby opposite-role users within 10 miles on a map + list
5. Host picks a sit-down restaurant and sends a dinner invite
6. Guest can accept or decline the invite
7. Demo clearly communicates: community connection, not dating

---

## Tech Stack (Final)

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast dev server, hot reload, AI knows it well |
| Styling | Tailwind CSS | Mobile-first, fast to iterate |
| Backend/Auth | Supabase | Managed auth + Postgres, zero backend code |
| State | React hooks + Context | Simple, no Redux overhead |
| Routing | React Router v6 | Standard SPA routing |
| Mobile | PWA | Installable on iOS/Android from browser |
| Location | HTML5 navigator.geolocation | Free, works everywhere |
| Maps | Leaflet.js + OpenStreetMap | Free, no API key |
| Restaurants | Seeded data (primary) | No quota risk on demo day |
| Hosting | Vercel | One-click deploy, auto HTTPS |
| Vibe coding | Cursor + Google Antigravity | Parallel agent workflows |

---

## Recommended Skills to Install

Install these two before building. That's it — more than this burns hackathon time.

```bash
# 1. Vitest patterns for React (essential — guides AI to write correct tests)
npx skills add vitestjs/vitest@testing-patterns

# 2. PWA best practices (needed on Day 1)
npx skills add alinaqi/claude-bootstrap@pwa-development
```

---

## Quick Start Commands

```bash
# 1. Create Vite React project
npm create vite@latest dinner-with -- --template react

# 2. Install dependencies
cd dinner-with
npm install
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p

# 3. Install app dependencies
npm install react-router-dom @supabase/supabase-js leaflet react-leaflet lucide-react

# 4. Run dev server
npm run dev

# 5. Run tests
npm test
```

---

## Supabase Setup (15 minutes)

1. Go to **supabase.com** → New Project
2. Name: `dinner-with-hackathon`
3. Region: US East
4. Copy Project URL and Anon Key

### Database Tables (SQL)

```sql
-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users primary key,
  name text not null,
  email text not null,
  phone text,
  role text check (role in ('host', 'guest')),
  avatar_url text,
  bio text check (char_length(bio) <= 200),
  lat numeric(10,8), lng numeric(11,8),
  city text, state text,
  profile_completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 2. Restaurants table
create table public.restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text, lat numeric(10,8), lng numeric(11,8),
  category text, is_sit_down boolean default true,
  source text check (source in ('seeded', 'google_places')),
  created_at timestamp with time zone default now()
);

-- 3. Invitations table
create table public.invitations (
  id uuid default gen_random_uuid() primary key,
  host_user_id uuid references auth.users not null,
  guest_user_id uuid references auth.users not null,
  restaurant_id uuid references public.restaurants,
  proposed_time timestamp with time zone,
  status text check (status in ('pending', 'accepted', 'declined', 'cancelled')) default 'pending',
  message text check (char_length(message) <= 300),
  created_at timestamp with time zone default now()
);

-- 4. Safety Reports table (Ported from V3)
create table public.safety_reports (
  id uuid default gen_random_uuid() primary key,
  reporter_user_id uuid references auth.users not null,
  reported_user_id uuid references auth.users not null,
  reason text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.invitations enable row level security;
alter table public.safety_reports enable row level security;

-- Policies
create policy "Profiles viewable by all" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Restaurants viewable by all" on public.restaurants for select using (true);
create policy "Invitations viewable by participants" on public.invitations for select using (auth.uid() = host_user_id or auth.uid() = guest_user_id);
create policy "Users create invitations" on public.invitations for insert with check (auth.uid() = host_user_id);
create policy "Users update invitations" on public.invitations for update using (auth.uid() = host_user_id or auth.uid() = guest_user_id);
create policy "Users can report" on public.safety_reports for insert with check (auth.uid() = reporter_user_id);
```

---

## PWA Setup (logic from V3)

**public/manifest.json**
```json
{
  "name": "Dinner with...",
  "short_name": "Dinner with",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#F59E0B",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**index.html head**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#F59E0B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Dinner with...">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

**public/sw.js**
```js
const CACHE_NAME = 'dinner-with-v1';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(urlsToCache)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
```

**Registration + Install Banner Logic (src/main.jsx)**
```jsx
// 1. Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// 2. Handle PWA Install Prompt (from V3 logic)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  // Trigger custom "Install App" banner logic here if standalone is false
});
```

---

## Testing Strategy (Ported from V3 logic)

Using **Vitest** + **React Testing Library**.

### Auth & Onboarding Tests
```jsx
// src/__tests__/Auth.test.jsx
// Mock tests for auth redirects and onboarding requirements
```

### Nearby Search Tests
```jsx
// src/__tests__/Nearby.test.jsx
// Mock tests for filtering users by 10 mile radius and role
```

---

## App Structure

```
src/
├── components/
│   ├── Layout.jsx, TrustBanner.jsx, RoleCard.jsx, UserCard.jsx
│   ├── MapView.jsx, InviteCard.jsx, BottomNav.jsx
├── pages/
│   ├── Welcome.jsx, OnboardingRole.jsx, OnboardingProfile.jsx
│   ├── Nearby.jsx, UserProfile.jsx, RestaurantPicker.jsx
│   ├── CreateInvite.jsx, Invitations.jsx, ProfileEdit.jsx
├── hooks/
│   ├── useAuth.js, useProfile.js, useNearby.js, useInvitations.js
├── lib/
│   ├── supabase.js, utils.js
├── context/
│   └── AuthContext.jsx
└── App.jsx
```

---

## Key Code Patterns

### Haversine Distance
```js
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

### Geolocation
```jsx
async function getLocation() {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });
      
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'User-Agent': 'DinnerWith/1.0' } }
      );
      const data = await res.json();
      setCity(data.address?.city || data.address?.town || '');
      setState(data.address?.state || '');
    },
    () => setLocationStatus('denied')
  );
}
```

---

## Vibe Coding Prompts

### Prompt 1 — Scaffold
```
Create Vite React app "Dinner with...":
- Vite React template + Tailwind CSS
- React Router v6
- Supabase client (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Lucide React icons, React Leaflet maps
- PWA: manifest.json, sw.js, register in main.jsx
- Install Logic: Handle beforeinstallprompt to show custom InstallBanner.jsx
- Folder structure: components/, pages/, hooks/, lib/, context/
- AuthContext with useAuth hook
- Routes: /, /onboarding/role, /onboarding/profile, /nearby, /users/:id, /invitations
- Mobile-first: 375px-390px width, 44px min tap targets
- Amber (#F59E0B) primary color
- TrustBanner on all authenticated pages
```

### Prompt 2 — Auth + Database
```
Setup Supabase and auth flow:
1. SQL schema: profiles, restaurants, invitations, AND safety_reports tables with RLS
2. Welcome page: Supabase Auth UI, "How it works" 4 steps, trust banner
3. useProfile hook: getProfile, updateProfile, createProfile
4. OnboardingRole page: Host/Guest cards, save role, redirect to profile
```

### Prompt 3 — Profile + Location
```
Build OnboardingProfile page:
- Form: name (required), bio (200 char limit), phone (optional)
- Avatar upload to Supabase Storage
- "Allow Location" button with navigator.geolocation
- Reverse geocode via Nominatim API
- Show: "📍 Detected: [City], [State]"
- Fallback: manual city/state inputs if denied
- Save: update profiles, set profile_completed_at, redirect to /nearby
- Protected route logic to force onboarding completion
```

### Prompt 4 — Nearby Map + List
```
Build Nearby page:
- Header "People Nearby", Map/List toggle, bottom nav
- Get user's lat/lng from profiles
- Fetch opposite role profiles, calculate distance with haversine
- Map: React Leaflet, OpenStreetMap tiles, user=blue dot, others=orange pins
- Popup: name, distance, bio, "View Profile" button
- List view: cards with avatar, name, distance, bio
- Empty state: "No one nearby yet — invite your friends!"
- Safety reminder banner: "Dinner with... is for connection - not dating."
```

### Prompt 5 — Profile + Restaurants
```
Build UserProfile and RestaurantPicker:
- UserProfile: avatar, name, distance, bio, city/state
- Host viewing Guest: "Invite to Dinner" button → /restaurants/pick?guestId=xxx
- Report User modal (saves to safety_reports table with reporter_id, reported_id, reason)
- RestaurantPicker: list nearby is_sit_down=true restaurants
- Each row: name, category, distance, "Select" button
- Select → /invitations/create?guestId=xxx&restaurantId=yyy
```

### Prompt 6 — Invitations
```
Build invitation flow:
- CreateInvite: show guest and restaurant, date/time picker, message (300 chars), required consent checkbox, submit creates pending invitation
- Invitations page: tabs (Pending/Accepted/Declined/Cancelled), cards with other person, restaurant, time, status badge
- Guest actions: Accept (updates status to 'accepted'), Decline (updates to 'declined')
- Host actions: Cancel button (updates to 'cancelled')
```

### Prompt 7 — Polish
```
Polish for demo:
- Buttons: amber-500, white text, rounded-xl, py-3
- Cards: white bg, shadow-sm, rounded-xl, p-4
- Bottom nav: Home, Invitations, Profile icons
- Loading spinners on all async actions
- Welcome: hero section, PWA install banner (visible only if standalone is false)
- Error handling: auth, network, form validation
- Test at 375px and 390px widths
```

### Prompt 8 — Seed + Demo
```
Create seed data and demo prep:
- 5 Host users, 5 Guest users within 8 miles of [YOUR CITY]
- Demo accounts: demo-host@example.com/demo123, demo-guest@example.com/demo123
- 20 restaurants (various cuisines, is_sit_down=true)
- 3 pending, 1 accepted, 1 declined invitations
- .env.example with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- README with setup instructions and demo credentials
```

---

## 3-Day Build Timeline

### Day 1 — Friday Mar 6 (Tonight!)
| Time | Task |
|---|---|
| 6:00–6:30 PM | Watch kickoff recording |
| 6:30–7:00 PM | Prompt 1: Scaffold + PWA Setup |
| 7:00–7:30 PM | Create Supabase project, run SQL (including safety_reports) |
| 7:30–8:30 PM | Prompt 2: Auth + Welcome + Role |
| 8:30–9:30 PM | Prompt 3: Profile + Location + Auth Guards |
| 9:30–10:00 PM | Push to GitHub, deploy to Vercel |
| 10:00 PM | STOP. Test on phone. Sleep. |

### Day 2 — Saturday Mar 7
| Time | Task |
|---|---|
| 3:00–5:00 PM | Prompt 4: Nearby map + list |
| 5:00–6:30 PM | Prompt 5: UserProfile + RestaurantPicker + Reporting |
| 6:30–8:00 PM | Prompt 6: Invitations flow (Accept/Decline/Cancel) |
| 8:00–8:30 PM | Dinner break |
| 8:30–9:30 PM | Prompt 7: UI polish + Install Banner |
| 9:30–10:00 PM | Prompt 8: Seed data |
| 10:00–10:30 PM | End-to-end test + Quick Unit Tests |
| 10:30 PM | STOP. Write demo script. Sleep. |

### Day 3 — Sunday Mar 8 (Deadline 12:00 PM ET)
| Time | Task |
|---|---|
| 8:00–8:30 AM | Bug fixes only |
| 8:30–9:00 AM | Reset demo data |
| 9:00–10:00 AM | Record 2-min demo video |
| 10:00–11:00 AM | Write submission post |
| 11:00–11:45 AM | Submit everything |
| 12:00 PM | HARD DEADLINE |
| 6:00 PM | Finals livestream |

---

## Demo Script (2 minutes)

```
0:00–0:15  "Elderly and isolated people eat alone. Dinner with... 
           fixes that. Community connection — not dating."

0:15–0:30  Sign up as Host. Choose role. Set location via GPS.

0:30–0:50  See nearby Guests on map within 10 miles. Tap profile.

0:50–1:10  Pick Guest, choose restaurant, send invite.

1:10–1:25  Switch to Guest. Invitation waiting. Accept it.

1:25–1:45  Dinner confirmed. Both know where and when.

1:45–2:00  "Dinner with... — because nobody should eat alone.
           Built in 3 days with React, Supabase, and vibe coding."
```

---

## Cut List (If Running Late)

| Cut | Replace With |
|---|---|
| Restaurant picker | Dropdown in invite form |
| Map view | List view only |
| Report user | Show button, skip wiring |
| Profile edit | Onboarding only |
| PWA banner | Works in browser |
| Avatar uploads | Initials/placeholders |

---

## Pre-Build Checklist

- [ ] GitHub repo created
- [ ] Supabase project created (save URL + anon key)
- [ ] Vercel account, GitHub connected
- [ ] Cursor installed
- [ ] App icons generated (realfavicongenerator.net)
- [ ] City lat/lng center noted
- [ ] These prompts ready to paste into Cursor

---

## Related Notes
- [[TASK-010 Dinner with app project]]
- [[TASK-010 Dinner with app project - V3 Vibe-Code Spec]]
- [[TASK-004 Hackathon competition March 2026]]
- [[TASK-008 Hackathon submission deadline + 2-minute demo]]

---

## Current blockers & next steps

- **Supabase schema + demo data**: Schema/policy/seed SQL is ready in `scripts/apply_supabase_schema.py`, but the published database (`db.qnnrpneuireiyefuzbcu.supabase.co`) currently resolves only to an IPv6 address that this environment cannot reach (`psycopg.OperationalError: failed to resolve host … getaddrinfo failed`). Run the script from a network with IPv6 connectivity or execute the SQL via the Supabase dashboard so the tables, policies, seeded restaurants, demo hosts/guests, invitations, and safety report exist before running the app.
- **Next steps**: Confirm `.env` points to the Supabase project once seeded, restart `npm run dev`, and exercise the Nearby + invitations flows with the seeded demo accounts (`demo-host@example.com`/`demo-guest@example.com`). If issues persist, capture the errors/screenshots and report them so fixes can be prioritized quickly.
