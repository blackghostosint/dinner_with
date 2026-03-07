# Dinner with...

**Because nobody should eat alone.**

---

## The Story

Every night, millions of people sit down to eat by themselves.

Not by choice. The recently widowed. The elderly neighbor whose children live far away. The newcomer who moved to a city where they don't know a soul. The person who just went through something hard and has no one to call.

We live in a time when it has never been easier to connect digitally — and never been harder to connect in person. We have thousands of followers and no one to share a meal with.

**Dinner with...** started as a simple question: what if a neighbor could just invite someone to dinner?

Not a date. Not charity. Not a program. Just a shared table at a local restaurant, covered by a host who wants to give back in the most human way possible — with their time, their presence, and a meal.

Hosts are people in the community who want to do something meaningful. Guests are anyone who would benefit from company — seniors, newcomers, people who are isolated, people who are lonely. Within 10 miles of each other. At a real sit-down restaurant. One conversation at a time.

This is community infrastructure. The kind that used to happen naturally — when neighbors knew each other, when church halls filled on Sundays, when someone always seemed to know you needed a meal. We are rebuilding that, quietly, one dinner at a time.

---

## How It Works

**Hosts** sign up, set their location, and browse guests within 10 miles. They pick a local sit-down restaurant, send an invitation, and cover the meal. The real gift is the conversation.

**Guests** sign up and wait to be invited. No cost. No pressure. Just show up and enjoy the company of someone who chose to reach out.

Both parties see each other's name, a short bio, and their distance. Nothing more until they agree to meet. Safety and trust are built into every step.

---

## What Was Built

This is a hackathon MVP — designed and built in 3 days to prove the core experience works.

- Choose your role — host or guest
- Create a profile with your location
- See people nearby on a live map within 10 miles
- Hosts send dinner invitations to a specific guest at a specific restaurant
- Guests accept or decline
- Both parties get the details — where, when, who

Everything is built around one principle: this is for connection, not dating. Trust banners, consent checkpoints, and safety reporting are woven through the entire app.

---

## Live App

**[dinnerwith.netlify.app](https://dinnerwith.netlify.app)**

Demo accounts for judges:
- Host: `demohost@dinnerwith.app` / `demo123456`
- Guest: `demoguest@dinnerwith.app` / `demo123456`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 (mobile-first) |
| Backend / Auth | Supabase (Postgres + managed auth) |
| Maps | Leaflet + OpenStreetMap |
| Location | HTML5 geolocation + IP fallback + Nominatim geocoding |
| Mobile | Progressive Web App (installable) |
| Hosting | Netlify |

---

## Run It Locally

```bash
git clone https://github.com/blackghostosint/dinner_with.git
cd dinner_with
npm install
```

Create a `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

```bash
npm run dev
```

The app requires a Supabase project with the schema from `scripts/supabase_manual.sql` applied. See the spec file for full setup details.

---

## Safety & Trust

Dinner with... is built on the premise that trust must be earned and protected.

- Every user acknowledges the community purpose before sending or accepting an invite
- Trust reminders appear throughout the app — this is not a dating platform
- Any user can report another at any time; reports are stored and reviewable
- Hosts and guests only see name, bio, and distance — no contact details until both agree to meet

---

## Built During

March 2026 Hackathon — 3 days, one idea, one question:

*What if a neighbor just invited someone to dinner?*
