# Dinner with... 🍽️

**Share a meal. Make a connection.**

Dinner with... is a community-first app built to connect hosts and guests for sit-down dinners at nearby restaurants. The goal is to lessen social isolation, especially for elders, by encouraging real-world meals—not dating.

> [!IMPORTANT]
> **Dinner with... is for social connection — NOT dating.** We prioritize consent, safety, and trust.

---

## 🚀 Hackathon MVP Status
Built during the March 2026 Hackathon to prove the core flow.

### Success Criteria
- [ ] User sign up / login / role selection (host vs guest)
- [ ] Profile creation with geolocation
- [ ] Discovery of opposite-role folks within a 10-mile radius
- [ ] Invitation creation from host → guest
- [ ] RSVP flows (guest accept/decline, host cancel)
- [ ] Safety reports + trust reminders across the app

---

## 🛠️ Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (mobile-first)
- **Backend/Auth**: Supabase (Postgres + managed auth)
- **Maps**: Leaflet + OpenStreetMap
- **Mobile**: Progressive Web App (service worker + install banner)
- **Testing**: Vitest + React Testing Library

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
# Clone the repo
git clone https://github.com/blackghostosint/dinner_with.git
cd dinner_with

# Install dependencies
npm install
```

### Development Workflow
```bash
# Run the dev server
npm run dev

# Run the test suite
npm test
```

---

## 🛡️ Safety & Trust
- Mandatory onboarding and consent before guests can browse nearby hosts.
- Trust banners remind users that Dinner with... is platonic.
- Safety reports feed into Supabase to flag concerning behavior.

---

## ⚙️ Environment
Copy `.env.example` (or create a `.env`) with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```
Without both values, auth, profile syncing, invitations, and reporting are disabled.

## 🧾 Supabase schema
The app relies on four tables: `profiles`, `restaurants`, `invitations`, and `safety_reports`. Each table enables row level security so users can only update their own rows while still reading public discovery data. The spec file (`TASK-010 Dinner with app project - V4 React-Vite Spec.md`) contains the SQL plus seeded data for the demo.

Run `scripts/apply_supabase_schema.py` (with `SUPABASE_DB_URL` or `--connection`/`--connection-file`) to apply the schema and optionally seed restaurants plus demo hosts/guests. Supply `--seed-restaurants` and `--seed-demo --host-ids <ids> --guest-ids <ids>` once you have real auth users in that project. This script keeps schema/seed SQL under version control without hard-coding credentials.

## 📱 PWA & assets
`public/manifest.json`, `public/sw.js`, and `public/icons/*` are preconfigured so the site can be installed as a PWA. `src/main.jsx` registers the service worker and stores the `beforeinstallprompt` event for a custom install experience.

---

## 📄 License
Private Repository - All Rights Reserved.

---

*Part of the TASK-010 Project Series.*
