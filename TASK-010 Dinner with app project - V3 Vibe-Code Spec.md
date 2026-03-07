---
id: TASK-010-V3
title: Dinner with... app — V3 Vibe-Code Spec
status: next
created: 2026-03-03T22:00:00-05:00
scheduled:
due: 2026-03-08T12:00:00-05:00
project: TASK-010
tags: [task, project, spec, hackathon, laravel, pwa, livewire, mvp]
---

# Dinner with... — V3 Vibe-Code Ready Spec

## Parent Notes
- [[TASK-010 Dinner with app project]]
- [[TASK-010 Dinner with app project - V2 Developer Spec]]
- [[TASK-004 Hackathon competition March 2026]]
- [[TASK-006 Hackathon kickoff livestream]]
- [[TASK-008 Hackathon submission deadline + 2-minute demo]]
- [[TASK-009 Hackathon finals livestream + winner announcement]]

---

## Objective
Build a hackathon MVP called **Dinner with...** that connects hosts and guests (especially elderly or socially isolated people) for sit-down meals at nearby restaurants. Social connection — not dating.

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
| Framework | Laravel 12 | Fast to scaffold, AI knows it well |
| Auth | Laravel Breeze | One command, clean starter |
| Frontend | Livewire 3 + Alpine.js + Tailwind CSS | No separate JS build, reactive, mobile-first |
| Mobile | PWA (manifest + service worker) | Installable on iOS/Android from browser, zero extra code |
| Location | HTML5 `navigator.geolocation` | Free, works in any mobile browser |
| Maps | Leaflet.js + OpenStreetMap | Free, no API key required |
| Restaurants | Seeded data (primary) + Google Places (optional) | No quota risk on demo day |
| Database | SQLite (dev) → MySQL (prod) | Zero config for local dev |
| Hosting | Laravel Cloud | First-party, zero config, auto HTTPS, auto-deploy from GitHub |
| Vibe coding | Cursor + Google Antigravity | Parallel agent workflows |

---

## Recommended Skills to Install

Install these two before building. That's it — more than this burns hackathon time.

```bash
# 1. Pest testing patterns for Laravel (essential — guides AI to write correct tests)
npx skills add spatie/freek.dev@pest-testing

# 2. PWA best practices (needed on Day 1)
npx skills add alinaqi/claude-bootstrap@pwa-development
```

---

## Quick Start Commands

```bash
# 1. Create Laravel project
laravel new dinner-with

# 2. Install Breeze with Livewire stack
composer require laravel/breeze --dev
php artisan breeze:install livewire
npm install && npm run dev

# 3. Run dev server
php artisan serve
npm run dev

# 4. Test on phone via staging URL (see Staging Setup below)
```

---

## Staging URL Setup (Laravel Cloud — first-party, HTTPS, takes ~10 min)

A staging URL gives you:
- HTTPS automatically (required for PWA install on iOS)
- A real URL to open on your phone without local network tricks
- A shareable link for judges and demo video

Laravel Cloud is made by the Laravel team — zero config, works with Laravel out of the box.

### Steps
1. Push your project to a GitHub repo (public or private)
2. Go to **cloud.laravel.com** → New Project → Connect GitHub repo
3. Laravel Cloud auto-detects your Laravel app
4. Add environment variables in the Cloud dashboard:
   ```
   APP_ENV=production
   APP_KEY=          ← run: php artisan key:generate --show
   APP_URL=https://your-app.laravel.cloud
   ```
5. Add a database: Dashboard → Databases → New MySQL database → link to your app
6. Set your deploy command:
   ```
   php artisan migrate --force
   ```
   > **Important:** Run `php artisan db:seed` manually once via the Laravel Cloud console after first deploy — do NOT put it in the auto-deploy command or it will wipe your data on every git push.
7. Deploy — you get a URL like `https://dinner-with.laravel.cloud`

> **Every git push to main auto-deploys.** Your staging URL stays live for the whole hackathon.

### Testing PWA install on your phone
- Android Chrome: open staging URL → browser menu → "Add to Home Screen"
- iOS Safari: open staging URL → Share icon → "Add to Home Screen"

---

## PWA Setup (add on Day 1 — takes ~30 min)

Three files to add to make the app installable on any phone:

**1. `public/manifest.json`**
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

**2. In `resources/views/layouts/app.blade.php` `<head>`**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#F59E0B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Dinner with...">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

**3. `public/sw.js`** (minimal service worker — required for installability)
```js
self.addEventListener('fetch', () => {});
```
Register it in your layout: `<script>navigator.serviceWorker?.register('/sw.js')</script>`

**4. Icons** — generate at realfavicongenerator.net, place in `public/icons/`

> To test install: open the app in Chrome on your phone → browser menu → "Add to Home Screen". On iOS Safari: Share → "Add to Home Screen".

---

## Data Model

### users
```
id, name, email, password
phone (nullable)
role: host|guest
avatar_url (nullable)
bio (nullable, max 200 chars)
home_address (nullable)
lat (decimal 10,8 nullable)
lng (decimal 11,8 nullable)
city (nullable), state (nullable)
profile_completed_at (nullable timestamp)
created_at, updated_at
```

### invitations
```
id
host_user_id (FK → users)
guest_user_id (FK → users)
restaurant_id (nullable FK → restaurants)
proposed_time (nullable datetime)
status: pending|accepted|declined|cancelled
message (nullable text)
created_at, updated_at
```

### restaurants
```
id, name
address, lat (decimal 10,8), lng (decimal 11,8)
category (varchar)
is_sit_down (boolean, default true)
source: seeded|google_places
provider_id (nullable, for Google Places)
```

### safety_reports
```
id
reporter_user_id (FK → users)
reported_user_id (FK → users)
reason (text)
created_at
```

---

## Livewire Components

> These replace V2's API contract. Each is a self-contained Livewire component.

| Component | Route | Who Sees It |
|---|---|---|
| `RoleSelection` | `/onboarding/role` | New users after registration |
| `ProfileSetup` | `/onboarding/profile` | New users after role selection |
| `LocationCapture` | Embedded in ProfileSetup | All users |
| `NearbyUsers` | `/nearby` | All authenticated users |
| `UserProfileView` | `/users/{id}` | All authenticated users |
| `RestaurantPicker` | `/restaurants/pick` | Hosts only |
| `InviteForm` | `/invitations/create` | Hosts only |
| `InviteList` | `/invitations` | All authenticated users |
| `ReportUser` | Modal (embedded) | All authenticated users |

---

## Screen-by-Screen Requirements

### 1. Welcome Screen (`/`)
- App name + tagline: "Share a meal. Make a connection."
- Sign Up / Log In buttons
- Trust statement visible: "Dinner with... is for social connection — not dating."

### 2. Role Selection (`/onboarding/role`) — `RoleSelection`
- Two large tap-friendly cards: **Host** and **Guest**
- Host: "I want to invite someone to dinner"
- Guest: "I'd love to join someone for dinner"
- Saves `role` to users table, redirects to `/onboarding/profile`

### 3. Profile Setup (`/onboarding/profile`) — `ProfileSetup` + `LocationCapture`
- Fields: name, bio (optional), phone (optional), avatar upload (optional)
- "Allow Location" button → HTML5 geolocation → saves lat/lng
- Shows detected city/state after capture
- Manual address fallback if permission denied
- On complete: sets `profile_completed_at`, redirects to `/nearby`

### 4. Nearby Screen (`/nearby`) — `NearbyUsers`
- Leaflet.js map (OpenStreetMap tiles) with pins for opposite-role users
- Toggle: map view ↔ list view
- Each pin popup + list card: first name, distance, bio snippet
- Radius: 10 miles (Haversine SQL query)
- Empty state: "No one nearby yet — invite your friends!"
- Map height: 50vh on mobile

### 5. User Profile View (`/users/{id}`) — `UserProfileView`
- Avatar, first name, distance from viewer, bio
- Host viewing Guest: "Invite to Dinner" button → `/restaurants/pick?guest={id}` (pick restaurant first)
- Report User button → opens `ReportUser` modal
- Trust/safety reminder copy below profile

### 6. Restaurant Picker (`/restaurants/pick`) — `RestaurantPicker`
- Nearby sit-down restaurants within 10 miles, `is_sit_down = true`
- Excludes fast-food categories
- Each row: name, category, distance
- Select → stores `restaurant_id` in session → goes to `/invitations/create`

### 7. Invite Form (`/invitations/create`) — `InviteForm`
- Pre-fills guest (from query param) and restaurant (from session)
- Date/time picker for `proposed_time`
- Optional message to guest
- Consent checkbox: "I understand this is a friendly community dinner, not a date."
- Submit creates invitation with `status = pending`

### 8. My Invitations (`/invitations`) — `InviteList`
- Tabs: Pending / Accepted / Declined / Cancelled
- Shows: other person's name, restaurant, proposed time, status badge
- Guest: Accept / Decline on pending invites
- Host: Cancel on pending invites

---

## Key Code Patterns

### HTML5 Geolocation (Alpine.js → Livewire)
```html
<div x-data="{ status: 'idle' }">
    <button @click="
        status = 'loading';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                status = 'done';
                $wire.set('lat', pos.coords.latitude);
                $wire.set('lng', pos.coords.longitude);
                $wire.call('reverseGeocode');
            },
            () => { status = 'denied'; }
        )
    ">
        Allow Location
    </button>
    <span x-show="status === 'loading'">Getting location...</span>
    <span x-show="status === 'denied'">Enter your address manually below.</span>
</div>
```

### Haversine Nearby Query (Laravel)
```php
$users = User::selectRaw("
    *, ( 3959 * acos( cos( radians(?) )
    * cos( radians(lat) )
    * cos( radians(lng) - radians(?) )
    + sin( radians(?) )
    * sin( radians(lat) ) ) ) AS distance",
    [$this->lat, $this->lng, $this->lat]
)
->where('role', $oppositeRole)
->whereNotNull('lat')
->whereNotNull('lng')
->having('distance', '<', 10)
->orderBy('distance')
->get();
```

### Reverse Geocode (Free — OpenStreetMap Nominatim)
```php
// In ProfileSetup Livewire component
public function reverseGeocode(): void
{
    $response = Http::withHeaders(['User-Agent' => 'DinnerWith/1.0'])
        ->get("https://nominatim.openstreetmap.org/reverse", [
            'lat' => $this->lat,
            'lon' => $this->lng,
            'format' => 'json',
        ]);

    $data = $response->json();
    $this->city = $data['address']['city'] ?? $data['address']['town'] ?? '';
    $this->state = $data['address']['state'] ?? '';
}
```

---

## Vibe Coding Prompts

> Copy-paste these into Cursor or Antigravity to build each feature. Replace `[YOUR CITY]` with your actual city.

### Prompt 1 — Initial Scaffold
```
I'm building a Laravel 12 app called "Dinner with..." using Livewire 3, Alpine.js,
and Tailwind CSS. It is a PWA (Progressive Web App) — installable on iOS and Android
from the browser. It connects Hosts and Guests for sit-down restaurant dinners.
It is NOT a dating app — it is a social connection app.

Set up the following:
1. Laravel Breeze with the Livewire stack
2. Add these columns to the users migration:
   - role (enum: host, guest, nullable)
   - bio (text, nullable, max 200 chars)
   - phone (varchar, nullable)
   - avatar_url (varchar, nullable)
   - lat (decimal 10,8, nullable)
   - lng (decimal 11,8, nullable)
   - city (varchar, nullable)
   - state (varchar, nullable)
   - home_address (varchar, nullable)
   - profile_completed_at (timestamp, nullable)
3. Create a restaurants table: id, name, address, lat, lng, category,
   is_sit_down (boolean default true), source (enum: seeded, google_places),
   provider_id (nullable)
4. Create an invitations table: id, host_user_id, guest_user_id, restaurant_id,
   proposed_time (nullable datetime), status (enum: pending, accepted, declined,
   cancelled, default pending), message (nullable text), timestamps
5. Create a safety_reports table: id, reporter_user_id, reported_user_id,
   reason (text), created_at
6. Use SQLite for local dev (update .env)
7. Mobile-first Tailwind design. All views must look great on a phone screen.
   Minimum button tap targets: 44px height.
```

### Prompt 2 — Onboarding Flow
```
In our "Dinner with..." Laravel/Livewire app, build the full onboarding flow:

After Breeze registration, redirect new users to /onboarding/role.

1. RoleSelection Livewire component at /onboarding/role:
   - Two large card buttons: Host ("I want to invite someone to dinner")
     and Guest ("I'd love to join someone for dinner")
   - On select: save role to auth user, redirect to /onboarding/profile
   - Mobile-first, cards full width, large tap targets

2. ProfileSetup Livewire component at /onboarding/profile:
   - Fields: name, bio (optional, max 200 chars with counter), phone (optional),
     avatar upload (optional, store in storage/app/public/avatars)
   - Location section:
     - "Allow Location" button using Alpine.js + HTML5 navigator.geolocation
     - On success: $wire.set lat and lng, then call reverseGeocode() method
     - reverseGeocode() hits Nominatim API (free) to get city/state
     - Show "📍 Detected: [City, State]" on success
     - If denied: show manual address text input
   - On save: set profile_completed_at = now(), redirect to /nearby

Add middleware to redirect users without profile_completed_at back to onboarding.
```

### Prompt 3 — Nearby Users Map + List
```
Build the NearbyUsers Livewire component at /nearby for "Dinner with...":

1. On mount: get auth user's lat/lng from database
2. Run Haversine SQL query to find opposite-role users within 10 miles
   who have lat/lng set and profile_completed_at not null:

   SELECT *, ( 3959 * acos( cos( radians(?) ) * cos( radians(lat) )
   * cos( radians(lng) - radians(?) ) + sin( radians(?) )
   * sin( radians(lat) ) ) ) AS distance
   FROM users WHERE role = ? HAVING distance < 10 ORDER BY distance

3. Display results on a Leaflet.js map using OpenStreetMap tiles (CDN)
   - Each user = map pin with popup: first name + distance + bio snippet
   - Map height: 50vh on mobile

4. Toggle button above map: "Map" | "List"
   - List view: card per user with avatar, first name, distance, bio snippet,
     "View Profile" button

5. Clicking a pin popup or list card navigates to /users/{id}

6. Empty state (no users nearby): warm illustrated message,
   "No one nearby yet — invite your friends to join!"

7. If auth user has no lat/lng set: show banner "Add your location to see
   who's nearby" with link to /onboarding/profile

Load Leaflet.js via CDN in the app layout. Include OpenStreetMap tile attribution.
```

### Prompt 4 — Invite Flow
```
Build the complete invite flow for "Dinner with...":

1. UserProfileView Livewire component at /users/{id}:
   - Shows: avatar (or initials fallback), first name, distance from auth user,
     bio, city/state
   - If auth user is Host AND viewing a Guest: show "Invite to Dinner" button
     → navigates to /restaurants/pick?guest={id} (restaurant picker first)
   - "Report User" link → triggers ReportUser modal
   - Trust/safety copy: "Remember: Dinner with... is for community connection,
     not dating. Stay safe and meet in public places."

2. RestaurantPicker Livewire component at /restaurants/pick:
   - Reads guest_id from query param, stores in session
   - Query restaurants within 10 miles of auth user where is_sit_down = true
   - Display as list: name, category, approximate distance
   - "Select" button per restaurant → store restaurant_id in session,
     redirect to /invitations/create?guest={guest_id}

3. InviteForm Livewire component at /invitations/create:
   - Shows selected guest's name and selected restaurant name (read-only)
   - Date picker for proposed_time (must be future date)
   - Optional message textarea (max 300 chars)
   - Consent checkbox (required): "I understand this is a friendly community
     dinner — not a romantic date. I will be respectful."
   - Submit: create invitation with status=pending, redirect to /invitations
   - Validation: guest_user_id and restaurant_id must exist

4. InviteList Livewire component at /invitations:
   - Tabs: Pending / Accepted / Declined / Cancelled
   - Each card: other person's name + avatar, restaurant name, proposed date/time,
     status badge with color (pending=yellow, accepted=green, declined=red, cancelled=gray)
   - Guest on pending: Accept (green) and Decline (red) buttons
   - Host on pending: Cancel button
   - All status changes handled by Livewire actions (no separate API needed)

5. ReportUser Livewire modal component:
   - Reason textarea (required)
   - Submit saves to safety_reports, shows "Thank you — we'll review this."
   - Can be triggered from any user profile view
```

### Prompt 5 — Trust & Safety + UI Polish
```
Polish "Dinner with..." for demo day:

1. Persistent banner in app layout (below nav):
   "Dinner with... is for social connection — not dating. Be kind, be safe,
   meet in public places." — subtle, warm background color, small text

2. Welcome page (/): add a "How it works" section:
   - Step 1: Create your profile
   - Step 2: Find someone nearby
   - Step 3: Host invites Guest to dinner
   - Step 4: Enjoy a meal and make a new friend

3. Bottom navigation bar (mobile-first, fixed to bottom):
   - Home (nearby map icon) → /nearby
   - Invitations (envelope icon) → /invitations
   - Profile (person icon) → /profile/edit

4. Profile edit page at /profile/edit: let user update bio, phone, re-capture
   location, change avatar

5. Design system:
   - Primary color: amber-500 (#F59E0B)
   - Background: white / gray-50
   - All CTAs: amber-500 with white text, rounded-xl
   - Cards: white bg, shadow-sm, rounded-xl, p-4
   - App header: white bg with "Dinner with..." wordmark in amber

6. Loading states: wire:loading spinner on all Livewire actions
7. All forms: show validation errors inline in red below each field
8. Responsive: test at 375px (iPhone SE) and 390px (iPhone 14) widths

PWA polish:
- Add a "Install App" banner at the top of the welcome page that appears when
  the app is not already installed (use the beforeinstallprompt JS event)
- Banner text: "Add Dinner with... to your home screen for the best experience"
  with an Install button
- Hide the banner if already running as standalone PWA
  (window.matchMedia('(display-mode: standalone)').matches)
```

### Prompt 6 — Demo Seed Data
```
Create a DatabaseSeeder for "Dinner with..." with realistic demo data:

Users:
- 5 Host users with names, bios mentioning they enjoy meeting new people,
  cooking interests, etc. Set lat/lng within 8 miles of [YOUR CITY, STATE]
  city center. Use city=[YOUR CITY], state=[YOUR STATE]
- 5 Guest users with bios, some mentioning they are retired or enjoy
  community connection. Lat/lng within 8 miles of same center.
- Special demo accounts:
  - demo-host@dinnerwith.app / password (Host, full profile)
  - demo-guest@dinnerwith.app / password (Guest, full profile)
- All users have profile_completed_at set

Restaurants (20 total, is_sit_down=true, source=seeded):
- Mix of categories: Italian, American, Mexican, Asian, Mediterranean
- Real-sounding names, addresses near [YOUR CITY]
- Lat/lng within 8 miles of city center

Invitations:
- 3 pending (host→guest, different restaurants)
- 1 accepted
- 1 declined

Run: php artisan db:seed
Reset: php artisan migrate:fresh --seed
```

---

## Antigravity Manager View Strategy

Run parallel agents to cut build time in half:

| Agent | Task |
|---|---|
| **Agent 1 — Backend** | Models, migrations, Livewire component PHP logic, DB queries |
| **Agent 2 — Frontend** | Blade views, Tailwind CSS, Alpine.js, Leaflet.js, PWA setup |

Start with Prompt 1 on Agent 1 only (scaffold must finish first), then split.

---

## 3-Day Build Timeline (Realistic Schedule)

> You work until 6 PM Friday and 9 AM–3 PM Saturday. Total real coding time: ~14 hours.
> The kickoff stream is at 1 PM Friday — watch the recording Friday evening before coding.

### Pre-Hackathon — Thursday Mar 5 (Do This Now)
| Task | Why |
|---|---|
| Create GitHub repo, push empty Laravel app | Don't waste Friday night on Git setup |
| Connect repo to Laravel Cloud | Auto-deploy working before hackathon starts |
| Install + configure Cursor | One less thing to figure out under pressure |
| Install recommended skills (`npx skills add ...`) | Cursor needs these before it can use them |
| Generate app icons at realfavicongenerator.net | Slow to do under deadline |
| Write down your city's lat/lng center | Needed for seed data prompt |
| Watch the V2 → V3 spec once end to end | Know your plan cold before you start |

### Day 1 — Friday Mar 6
| Time | Task |
|---|---|
| 1:00 PM | Kickoff stream starts — **you're at work, catch the recording later** |
| 6:00–6:30 PM | Watch kickoff recording — note judging criteria |
| 6:30–7:30 PM | Run scaffold commands (Prompt 1) — auth, migrations, SQLite |
| 7:30–8:00 PM | Add PWA files (manifest, sw.js, meta tags, icons) |
| 8:00–9:30 PM | Prompt 2 → onboarding (role selection + profile + location) |
| 9:30–10:00 PM | Commit + push → verify Laravel Cloud deploy succeeds |
| 10:00 PM | **Stop.** Test staging URL on phone. Note bugs, don't fix tonight. |

### Day 2 — Saturday Mar 7
| Time | Task |
|---|---|
| 9:00 AM–3:00 PM | At work — **light review only**: read AI output, note issues, no major coding |
| 2:00 PM | Optional check-in stream — watch if you can |
| 3:00–5:30 PM | Prompt 3 → nearby users map (hardest feature, give it full time) |
| 5:30–7:30 PM | Prompt 4 → invite flow (send, accept, decline) |
| 7:30–8:30 PM | Prompt 6 → seed data (`migrate:fresh --seed`, verify demo accounts work) |
| 8:30–9:30 PM | Prompt 5 → UI polish + trust & safety copy |
| 9:30–10:00 PM | Full end-to-end test on phone via staging URL |
| 10:00 PM | Commit + push. Write your 2-minute demo script. **Stop coding.** |

### Day 3 — Sunday Mar 8 (Deadline 12:00 PM ET)
| Time | Task |
|---|---|
| 8:00–8:30 AM | `migrate:fresh --seed` on staging — verify demo data loads cleanly |
| 8:30–9:00 AM | One final bug fix pass — **do not add features** |
| 9:00–10:00 AM | Record 2-minute demo video (use staging URL on real phone) |
| 10:00–11:00 AM | Write submission post |
| 11:00–11:45 AM | Submit everything, double-check confirmation |
| 12:00 PM | **HARD DEADLINE** |
| 6:00 PM | Finals livestream |

---

## Demo Script Template (write this Saturday night)

```
0:00–0:15  Problem: elderly and isolated people eat alone. Dinner with... fixes that.
0:15–0:30  Sign up as a Host. Choose your role. Set your location.
0:30–0:50  See nearby Guests on the map within 10 miles.
0:50–1:10  Tap a Guest's profile. Invite them to dinner at [restaurant].
1:10–1:25  Switch to Guest account — invitation waiting. Accept it.
1:25–1:45  Show the accepted invite. Dinner is confirmed.
1:45–2:00  "Dinner with... — social connection, not dating. Built with Laravel in 3 days."
```

---

## Feature Priority If Running Out of Time

If you hit Saturday evening and the invite flow isn't done, cut in this order:

| Cut This | Replace With |
|---|---|
| Restaurant picker screen | Simple dropdown of seeded restaurants in the invite form |
| Report user flow | Show the button, skip wiring it up |
| Profile edit page | Onboarding is enough for the demo |
| PWA install prompt banner | App still works in mobile browser without it |
| Map view | List view only is a valid demo |

---

## Trust/Safety MVP Controls
- Community statement on every page
- Report user button on all profile + invite screens
- Consent checkbox required before sending and accepting an invite
- `safety_reports` table ready for moderation post-hackathon

---

## Testing Strategy

Laravel 12 ships with **Pest v3** by default. Run tests after each prompt to catch regressions before they stack up.

```bash
php artisan test                    # run all tests
./vendor/bin/pest --dirty           # run only tests for changed files (Pest CLI)
php artisan test --filter AuthTest  # run a specific test file
```

### When to run tests
- After each vibe coding prompt completes
- Before every git push
- First thing Sunday morning before recording the demo

---

### Test approach: two patterns

- **Page load tests** (GET routes) → use HTTP `$this->actingAs()->get()` — works because Livewire renders server-side on first load
- **Action tests** (form submits, button clicks) → use `Livewire::test(ComponentClass::class)` — tests the component directly, no fake HTTP routes needed

---

### Test Suite (add these as you build each prompt)

#### Auth Tests — run after Prompt 1
```php
// tests/Feature/AuthTest.php
it('registers a new user and redirects to onboarding', function () {
    $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect('/onboarding/role');

    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
});

it('unauthenticated users cannot access nearby', function () {
    $this->get('/nearby')->assertRedirect('/login');
});
```

#### Onboarding Tests — run after Prompt 2
```php
// tests/Feature/OnboardingTest.php
use App\Livewire\RoleSelection;
use App\Livewire\ProfileSetup;

it('saves role and redirects to profile setup', function () {
    $user = User::factory()->create(['role' => null]);

    Livewire::actingAs($user)
        ->test(RoleSelection::class)
        ->set('role', 'host')
        ->call('save')
        ->assertRedirect('/onboarding/profile');

    expect($user->fresh()->role)->toBe('host');
});

it('saves profile and marks onboarding complete', function () {
    $user = User::factory()->create(['role' => 'host', 'profile_completed_at' => null]);

    Livewire::actingAs($user)
        ->test(ProfileSetup::class)
        ->set('name', 'Jane Host')
        ->set('bio', 'Love meeting new people')
        ->set('lat', 40.7128)
        ->set('lng', -74.0060)
        ->call('save')
        ->assertRedirect('/nearby');

    expect($user->fresh()->profile_completed_at)->not->toBeNull();
});

it('redirects users with no profile back to onboarding', function () {
    $user = User::factory()->create(['profile_completed_at' => null]);
    $this->actingAs($user)->get('/nearby')->assertRedirect('/onboarding/role');
});
```

#### Nearby Search Tests — run after Prompt 3
```php
// tests/Feature/NearbyUsersTest.php
// GET page tests work fine — Livewire renders initial HTML server-side
it('shows nearby opposite-role users', function () {
    $host = User::factory()->create([
        'role' => 'host', 'lat' => 40.7128, 'lng' => -74.0060,
        'profile_completed_at' => now(),
    ]);
    $nearbyGuest = User::factory()->create([
        'role' => 'guest', 'lat' => 40.7200, 'lng' => -74.0100,
        'profile_completed_at' => now(),
    ]);
    $farGuest = User::factory()->create([
        'role' => 'guest', 'lat' => 41.8781, 'lng' => -87.6298,
        'profile_completed_at' => now(),
    ]);

    $this->actingAs($host)->get('/nearby')
        ->assertSee($nearbyGuest->name)
        ->assertDontSee($farGuest->name);
});

it('does not show same-role users', function () {
    $host1 = User::factory()->create(['role' => 'host', 'lat' => 40.7128, 'lng' => -74.0060, 'profile_completed_at' => now()]);
    $host2 = User::factory()->create(['role' => 'host', 'lat' => 40.7200, 'lng' => -74.0100, 'profile_completed_at' => now()]);

    $this->actingAs($host1)->get('/nearby')->assertDontSee($host2->name);
});
```

#### Invitation Tests — run after Prompt 4
```php
// tests/Feature/InvitationTest.php
use App\Livewire\InviteForm;
use App\Livewire\InviteList;

it('host can create an invitation', function () {
    $host = User::factory()->create(['role' => 'host', 'profile_completed_at' => now(), 'lat' => 40.7128, 'lng' => -74.0060]);
    $guest = User::factory()->create(['role' => 'guest', 'profile_completed_at' => now()]);
    $restaurant = Restaurant::factory()->create(['is_sit_down' => true]);

    Livewire::actingAs($host)
        ->test(InviteForm::class, ['guestId' => $guest->id, 'restaurantId' => $restaurant->id])
        ->set('proposedTime', now()->addDays(3)->toDateTimeString())
        ->set('consent', true)
        ->call('submit')
        ->assertRedirect('/invitations');

    $this->assertDatabaseHas('invitations', [
        'host_user_id' => $host->id,
        'guest_user_id' => $guest->id,
        'status' => 'pending',
    ]);
});

it('guest can accept an invitation', function () {
    $invitation = Invitation::factory()->create(['status' => 'pending']);

    Livewire::actingAs($invitation->guest)
        ->test(InviteList::class)
        ->call('accept', $invitation->id);

    expect($invitation->fresh()->status)->toBe('accepted');
});

it('guest can decline an invitation', function () {
    $invitation = Invitation::factory()->create(['status' => 'pending']);

    Livewire::actingAs($invitation->guest)
        ->test(InviteList::class)
        ->call('decline', $invitation->id);

    expect($invitation->fresh()->status)->toBe('declined');
});

it('host cannot accept their own invitation', function () {
    $invitation = Invitation::factory()->create(['status' => 'pending']);

    Livewire::actingAs($invitation->host)
        ->test(InviteList::class)
        ->call('accept', $invitation->id)
        ->assertForbidden();
});

it('only shows sit-down restaurants in picker', function () {
    Restaurant::factory()->create(['is_sit_down' => true, 'name' => 'Nice Bistro']);
    Restaurant::factory()->create(['is_sit_down' => false, 'name' => 'Fast Burger']);

    $host = User::factory()->create(['role' => 'host', 'profile_completed_at' => now(), 'lat' => 40.7128, 'lng' => -74.0060]);
    $this->actingAs($host)->get('/restaurants/pick')
        ->assertSee('Nice Bistro')
        ->assertDontSee('Fast Burger');
});
```

#### Safety Tests — run after Prompt 5
```php
// tests/Feature/SafetyTest.php
use App\Livewire\ReportUser;

it('user can report another user', function () {
    $reporter = User::factory()->create(['profile_completed_at' => now()]);
    $reported = User::factory()->create(['profile_completed_at' => now()]);

    Livewire::actingAs($reporter)
        ->test(ReportUser::class, ['reportedUserId' => $reported->id])
        ->set('reason', 'Inappropriate behavior')
        ->call('submit')
        ->assertDispatched('report-submitted');

    $this->assertDatabaseHas('safety_reports', [
        'reporter_user_id' => $reporter->id,
        'reported_user_id' => $reported->id,
    ]);
});
```

### Add to Prompt 1 — required for tests to work
> Add this line at the end of Prompt 1:
> "Create model factories for User, Restaurant, and Invitation with realistic fake data using Faker. User factory should support states: `host()`, `guest()`, `withLocation()`, `profileComplete()`."

---

### Phone testing (run throughout)
- Open your **staging URL** (Laravel Cloud) on your phone — HTTPS works for PWA install
- Chrome on Android: browser menu → "Add to Home Screen"
- Safari on iOS: Share → "Add to Home Screen"
- Test at iPhone SE size (375px) and standard Android (390px)

### Demo fallback
- Seeded accounts + restaurants always work without any external API
- `php artisan migrate:fresh --seed` resets everything cleanly
- List view fallback if map has issues

---

## Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Geolocation denied by user | Manual address entry fallback in ProfileSetup |
| Leaflet map rendering issues | List-only toggle always available in NearbyUsers |
| Google Places API quota | Seeded restaurants are primary; Places is optional bonus |
| PWA not installable on iOS | iOS requires HTTPS + Safari; Laravel Cloud provides HTTPS automatically |
| Scope creep | Freeze at Prompt 5. Everything else is post-hackathon |
| Demo nerves | Script written Sat night, full rehearsal Sun morning |

---

## Post-Hackathon Roadmap (Out of Scope Now)
- **True native app**: wrap with Capacitor (Ionic) → submit to App Store + Play Store
- **Push notifications**: add via web push (PWA) or Capacitor plugin
- AI interest-based matching (interests, hometown, shared history)
- In-app messaging / chat
- Background checks / trust & safety operations
- Subscription tiers / payments
- NativePHP Air (revisit once AI tooling catches up to v3)

---

## Related Notes
- [[TASK-010 Dinner with app project]]
- [[TASK-010 Dinner with app project - V2 Developer Spec]]
- [[TASK-004 Hackathon competition March 2026]]
- [[TASK-008 Hackathon submission deadline + 2-minute demo]]
- [[TASK-009 Hackathon finals livestream + winner announcement]]
