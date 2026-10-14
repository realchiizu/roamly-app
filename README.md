<div align="center">
  <h1>🌍 Roamly</h1>
  <p><b>Your intelligent travel operating system.</b></p>
  <p>Frictionless, AI-generated multi-day itineraries paired with flight tracking, interactive checklists, and a self-cleaning guest sandbox for seamless portfolio demonstrations.</p>

  <p>
    <img src="https://img.shields.io/badge/Release-v1.0.0-blue?style=flat-square&logo=git&logoColor=white" alt="Release">
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind">
    <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/AI-Gemini%201.5-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini">
  </p>
</div>

> **Important:** Designed as a production-grade full-stack showcase. Features an automated sandbox system to let visitors, reviewers, and recruiters freely test AI workflows without manual account creation or database pollution.

* **Frictionless by design:** Includes a one-click **"Explore as Guest"** session with zero signup forms required.
* **Master Trip Shield:** Core demonstration trips (e.g., Tokyo, Paris) are protected by database-level policies and cannot be altered or removed by guest actions.
* **Automated 24h Purge:** A native PostgreSQL background engine (`pg_cron`) wipes transient guest additions, generated plans, and checklists on a daily schedule.
* **Robust Gemini Integration:** Built on Google's Gemini 1.5 Flash via Supabase Edge Functions with automatic upstream error handling for 503 high-demand conditions.

---

## Contents

1. [Architecture & Features](#-architecture--features)
2. [Project File Map](#-project-file-map)
3. [Tech Stack](#-tech-stack)
4. [Getting Started](#-getting-started)
5. [Demo Mode & Self-Cleaning Infrastructure](#-demo-mode--self-cleaning-infrastructure)
6. [Known Edge Cases & Engineering Fixes](#-known-edge-cases--engineering-fixes)
7. [Deployment & Runbook](#-deployment--runbook)
8. [License](#-license)

---

## Architecture & Features

* **AI Itinerary Engine:** Prompts Gemini 1.5 Flash through server-side Deno Edge Functions, enforcing structured JSON schemas with custom activities, timing, and emoji markers.
* **Logistics & Flight Tracker:** Integrates third-party flight queries alongside dynamic location galleries powered by Unsplash.
* **Interactive Trip Planner:** Dynamic timeline visualization featuring full CRUD for itinerary events, custom checklist tracking, and image galleries.
* **Relational Data & Security:** Backed by Supabase PostgreSQL with strict Row-Level Security (RLS) isolating authenticated users while granting controlled guest read/write access.

---

## Project File Map

A directory reference for navigating both frontend components and server-side functions:

```text
├── public/                                # Static web assets & icons
├── supabase/
│   └── functions/
│       └── suggest-itinerary/             # Gemini 1.5 Flash Edge Function
│           └── index.ts                   # System prompt, upstream fetch & error interceptor
├── src/
│   ├── components/                        # UI and view components
│   │   ├── GalleryTab.tsx                 # Unsplash photo curation & displays
│   │   ├── GlassCard.tsx                  # Reusable translucent glassmorphic card container
│   │   ├── ItineraryTab.tsx               # Timeline view & manual event creation form
│   │   ├── LoadingSkeleton.tsx            # Animated placeholder states during AI loads
│   │   ├── LogisticsTab.tsx               # AI prompt controls & flight logistics tab
│   │   ├── NavLink.tsx                    # Active link navigation helper
│   │   ├── PackingListTab.tsx             # Interactive trip packing & luggage checklists
│   │   ├── ThemeToggle.tsx                # Dark / light interface mode switch
│   │   └── TravelCard.tsx                 # Dashboard trip overview card
│   ├── contexts/
│   │   └── AuthContext.tsx                # User session, profile nicknames & demo credentials
│   ├── hooks/
│   │   ├── use-mobile.tsx                 # Responsive viewport breakpoint detection
│   │   └── use-toast.ts                   # UI notification dispatcher
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts                  # Supabase client instantiation
│   │       └── types.ts                   # Database schema TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts                       # ClassName and utility styling helpers (clsx, twMerge)
│   ├── pages/
│   │   ├── Auth.tsx                       # Login, registration, and "Explore as Guest" action
│   │   ├── Index.tsx                      # Primary trip library & dashboard overview
│   │   ├── NotFound.tsx                   # Fallback 404 handler
│   │   ├── SharedTrip.tsx                 # Public view for shared/cloned trips
│   │   └── TripDetail.tsx                 # Tab container (Logistics, Itinerary, Packing, Gallery)
│   ├── App.tsx                            # Root client routing configuration
│   ├── main.tsx                           # Application mounting entry point
│   └── index.css                          # Tailwind CSS base styles & CSS variables
├── package.json                           # Workspace dependencies & build scripts
├── tailwind.config.ts                     # Design system tokens & animations
├── vercel.json                            # Routing fallbacks for SPA production deployments
└── vite.config.ts                         # Client build & development server config
```
---

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend Framework** | React (Vite), TypeScript | Component hierarchy and strong typing |
| **Styling & UI** | Tailwind CSS, Framer Motion | Glassmorphism system, responsive layout, animations |
| **Intelligence** | Google Gemini 1.5 Flash | Structured multi-day itinerary generation |
| **Serverless Backend** | Supabase Edge Functions (Deno) | Secure API key proxying, Gemini schema validation |
| **Database & Engine** | PostgreSQL, pg_cron | Relational tables, RLS authorization, scheduled cleanup |
| **Auth** | Supabase GoTrue | Session persistence and managed guest access |
| **Deployment** | Vercel & Supabase Platform | Continuous integration, static hosting, and edge runtime |

---

## Getting Started

### Prerequisites

* Node.js 18+ (or Bun/npm)
* Supabase CLI (for modifying edge functions)

### 1. Clone & Install

```bash
git clone [https://github.com/realchiizu/roamly.git](https://github.com/realchiizu/roamly.git)
cd roamly
npm install

```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
VITE_SUPABASE_ANON_KEY=your-anon-key

```

### 3. Run Development Server

```bash
npm run dev

```

---

## Demo Mode & Self-Cleaning Infrastructure

To allow guests to test all features without degrading the portfolio for subsequent visitors, Roamly separates static demo records from transient user data.

### The Database Flag

Every record in `public.trips` contains an `is_demo_master` boolean:

* **`true`**: Protected sample trip (Tokyo, Paris). Exempt from purge operations.
* **`false`**: Created during live visits or guest interactions.

### Nightly Vacuum Automation (`pg_cron`)

A scheduled PostgreSQL function runs at midnight every day to purge transient guest data:

```sql
CREATE OR REPLACE FUNCTION public.cleanup_demo_data()
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
    guest_id uuid := 'GUEST_USER_UUID';
BEGIN
    -- 1. Cascade delete all child items attached to non-master trips
    DELETE FROM public.itinerary_items 
    WHERE trip_id IN (
        SELECT id FROM public.trips 
        WHERE user_id = guest_id AND is_demo_master = false
    );

    -- 2. Delete packing records attached to non-master trips
    DELETE FROM public.packing_items 
    WHERE trip_id IN (
        SELECT id FROM public.trips 
        WHERE user_id = guest_id AND is_demo_master = false
    );

    -- 3. Delete non-master trips
    DELETE FROM public.trips 
    WHERE user_id = guest_id AND is_demo_master = false;
END;
$$;

-- Registered on pg_cron schedule
SELECT cron.schedule('demo-cleanup', '0 0 * * *', $$ SELECT public.cleanup_demo_data(); $$);

```

---

## Known Edge Cases & Engineering Fixes

* **Gemini 503 "High Demand" Flushes:**
* *Root Cause:* Free and high-traffic AI tiers intermittently reject incoming generation calls with HTTP 503 UNAVAILABLE, crashing edge workers into generic HTTP 500s.
* *Solution:* The edge function explicitly catches upstream status 503, returning a non-crashing response payload so the client UI triggers a polite retry notification.


* **Foreign Key Blockers on Purge:**
* *Root Cause:* Direct trip deletions failed silently due to dependent child rows in `itinerary_items`.
* *Solution:* Restructured the cleanup procedure to execute in an exact cascade order (child tables first, parent trip last).


* **Missing Itinerary Item Saves:**
* *Root Cause:* Manual additions bypassed required fields (`trip_id`, `user_id`, or `day_label`) that were otherwise auto-populated by the AI batch function.
* *Solution:* Standardized the `onAdd` callback interface in `TripDetail.tsx` to bind active `trip_id` and user credentials directly to every manual payload.



---

## Deployment & Runbook

### Deploying Frontend Updates

All pushes directly to the `main` branch trigger automated builds and preview deployments via Vercel:

```bash
git push origin main

```

### Deploying Edge Functions

When editing prompt parameters or error handlers in `supabase/functions/`:

```bash
supabase functions deploy suggest-itinerary

```

### Verifying Database Cron Jobs

Check the health and recent run logs of the cleanup worker directly inside Supabase SQL Editor:

```sql
-- View scheduled status
SELECT jobid, jobname, schedule, active FROM cron.job;

-- View recent execution logs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;

```

---

## License

This project is currently maintained as a personal portfolio project.

