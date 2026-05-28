<div align="center">

<!-- Banner: replace the URL below with your own hero screenshot (e.g. /docs/banner.png) -->
<img width="1200" alt="Dark Portfolio — Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

<br />
<br />

<h1>
  ✦ Dark Portfolio &mdash; Landing Page ✦
</h1>

<p>
  <strong>A cinematic, fully&ndash;CMS&ndash;driven portfolio built with React 19, Vite, Tailwind v4, GSAP &amp; WebGL.</strong>
  <br />
  Animated aurora backgrounds, glass surfaces, crossfaded ambient music, and a built&ndash;in back office with live preview.
</p>

<p>
  <a href="#-quick-start"><img alt="Quick Start" src="https://img.shields.io/badge/Quick%20Start-→-89AACC?style=for-the-badge&labelColor=0a0a0a" /></a>
  <a href="#-back-office-cms"><img alt="CMS" src="https://img.shields.io/badge/Back%20Office%20CMS-/bts--porto-4E85BF?style=for-the-badge&labelColor=0a0a0a" /></a>
  <a href="#-deployment"><img alt="Deploy" src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&labelColor=0a0a0a" /></a>
</p>

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" />
  <img alt="GSAP" src="https://img.shields.io/badge/GSAP-3-88CE02?logo=greensock&logoColor=white&style=flat-square" />
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-r184-000000?logo=threedotjs&logoColor=white&style=flat-square" />
  <img alt="Framer Motion" src="https://img.shields.io/badge/Framer%20Motion-12-0055FF?logo=framer&logoColor=white&style=flat-square" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase&logoColor=white&style=flat-square" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-Ready-000000?logo=vercel&logoColor=white&style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-89AACC?style=flat-square" />
</p>

</div>

---

## ✨ Highlights

> A portfolio that doesn't look like a portfolio template &mdash; built to feel like a magazine, animate like a product launch, and update like a CMS.

- 🌌 **Animated Aurora background** rendered live with WebGL (OGL).
- 🎬 **GSAP + Framer Motion** entrance choreography and scroll&ndash;driven micro&ndash;interactions.
- 🪟 **Glassmorphism surfaces**, shiny text, border&ndash;glow, noise grain, and a custom loading screen.
- 🎧 **Background ambient music** with crossfaded tracks and a toggle that lives inside the nav pill.
- 🛠️ **Built&ndash;in CMS at `/bts-porto`** with section editors, image/audio upload, and an in&ndash;browser live preview iframe.
- ⚡ **Supabase Realtime** &mdash; save in the back office, the public site re&ndash;renders instantly.
- 📱 **Fully responsive**, dark&ndash;first, with a tasteful typographic system (Inter + Instrument Serif).
- 📊 **Vercel Analytics &amp; Speed Insights** wired in out of the box.

---

## 🗺️ Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Architecture](#-architecture)
3. [Quick Start](#-quick-start)
4. [Environment Variables](#-environment-variables)
5. [Available Scripts](#-available-scripts)
6. [Project Structure](#-project-structure)
7. [Routes](#-routes)
8. [Back Office CMS](#-back-office-cms)
9. [Supabase Setup](#-supabase-setup)
10. [Customization Guide](#-customization-guide)
11. [Deployment](#-deployment)
12. [Roadmap](#-roadmap)
13. [Contributing](#-contributing)
14. [License](#-license)
15. [Acknowledgments](#-acknowledgments)

---

## 🧱 Tech Stack

<table>
<thead>
<tr>
<th align="left">Layer</th>
<th align="left">Tooling</th>
<th align="left">Why it&rsquo;s here</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Framework</strong></td>
<td>React 19 &middot; React Router 7 &middot; Vite 6</td>
<td>Modern SPA with fast HMR and code&ndash;splitting.</td>
</tr>
<tr>
<td><strong>Language</strong></td>
<td>TypeScript 5.8</td>
<td>End&ndash;to&ndash;end type safety, even for Supabase rows.</td>
</tr>
<tr>
<td><strong>Styling</strong></td>
<td>Tailwind CSS v4 &middot; <code>tailwind-merge</code> &middot; <code>clsx</code></td>
<td>Utility&ndash;first with a custom HSL token system.</td>
</tr>
<tr>
<td><strong>Motion</strong></td>
<td>GSAP 3 &middot; Framer Motion 12 &middot; Motion</td>
<td>Stage&ndash;perfect timelines + spring&ndash;driven UI.</td>
</tr>
<tr>
<td><strong>3D &amp; WebGL</strong></td>
<td>Three.js &middot; @react&ndash;three/fiber &middot; @react&ndash;three/drei &middot; OGL</td>
<td>Aurora, beams, and ambient shaders.</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Supabase (Postgres + Auth + Storage + Realtime)</td>
<td>CMS persistence, asset uploads, live sync.</td>
</tr>
<tr>
<td><strong>Media</strong></td>
<td>hls.js &middot; HTMLAudioElement crossfading</td>
<td>Streaming video posters &amp; ambient soundtrack.</td>
</tr>
<tr>
<td><strong>Telemetry</strong></td>
<td>@vercel/analytics &middot; @vercel/speed&ndash;insights</td>
<td>Page views and Core Web Vitals without bloat.</td>
</tr>
<tr>
<td><strong>Icons</strong></td>
<td>lucide&ndash;react &middot; react&ndash;icons</td>
<td>Consistent monoline iconography.</td>
</tr>
</tbody>
</table>

---

## 🏛️ Architecture

```
                     ┌─────────────────────────────────────────┐
                     │             Browser (React 19)          │
                     └─────────────────────────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                ▼                      ▼                      ▼
        ┌──────────────┐      ┌────────────────┐     ┌────────────────┐
        │  Public Site │      │  Back Office   │     │   Loading /    │
        │   (/, /work, │◀────▶│  (/bts-porto)  │     │  Aurora / GSAP │
        │   /resume…)  │      │   CMS + Auth   │     │   Choreography │
        └──────────────┘      └────────────────┘     └────────────────┘
                │                      │
                ▼                      ▼
       ┌────────────────────────────────────────────────┐
       │  PortfolioDataContext  (Supabase fan-in fetch) │
       │  • 1 round-trip → 29 tables hydrated           │
       │  • Realtime channels → auto re-fetch on save   │
       └────────────────────────────────────────────────┘
                │                      │
                ▼                      ▼
        ┌──────────────┐      ┌────────────────┐
        │   Postgres   │      │   Storage      │
        │  (Supabase)  │      │  (images/audio)│
        └──────────────┘      └────────────────┘
                │
                ▼
        ┌──────────────────────────────┐
        │  Vercel  •  Analytics  •  CDN│
        └──────────────────────────────┘
```

The public site and the CMS share the **same Supabase schema**. Editors save through the back office, Supabase broadcasts a Realtime event, [`PortfolioDataContext.tsx`](src/contexts/PortfolioDataContext.tsx) re&ndash;fetches, and the public site re&ndash;renders &mdash; no rebuild required.

---

## 🚀 Quick Start

### Prerequisites

| Tool      | Version | Notes                                              |
|-----------|---------|----------------------------------------------------|
| Node.js   | ≥ 18    | LTS recommended (Vite 6 requires modern Node).     |
| npm       | ≥ 9     | Or `pnpm` / `yarn` &mdash; lockfile is npm.        |
| Supabase  | any     | Free tier is enough. Project URL + anon key.       |

### 1 &middot; Clone &amp; install

```bash
git clone https://github.com/your-username/dark-portfolio-landing-page.git
cd dark-portfolio-landing-page
npm install
```

### 2 &middot; Configure environment

```bash
cp .env.example .env
```

Then open [`.env`](.env) and fill in your keys &mdash; see [Environment Variables](#-environment-variables) below.

### 3 &middot; Run the dev server

```bash
npm run dev
```

The site is now live at **http://localhost:3000**. The CMS is at **http://localhost:3000/bts-porto**.

> 💡 **First run shows default content.** Until Supabase is provisioned and seeded, the app gracefully falls back to demo data baked into [`PortfolioDataContext.tsx`](src/contexts/PortfolioDataContext.tsx) &mdash; nothing breaks.

---

## 🔑 Environment Variables

All variables live in `.env` at the repo root (it&rsquo;s already in [`.gitignore`](.gitignore)).

```dotenv
# Supabase ─ required for the CMS and live content
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

| Variable                  | Required | Where to find it                                          |
|---------------------------|:--------:|-----------------------------------------------------------|
| `VITE_SUPABASE_URL`       | ✅       | Supabase Dashboard → Settings → API → **Project URL**     |
| `VITE_SUPABASE_ANON_KEY`  | ✅       | Supabase Dashboard → Settings → API → **anon public key** |

> ⚠️ **Never commit the service&ndash;role key.** Only the **anon** key belongs in the browser bundle &mdash; row&ndash;level security in Supabase does the rest.

---

## 📜 Available Scripts

| Command           | What it does                                                                 |
|-------------------|------------------------------------------------------------------------------|
| `npm run dev`     | Start Vite dev server on `http://localhost:3000` with HMR.                   |
| `npm run build`   | Type&ndash;check optional, output production bundle to `dist/`.              |
| `npm run preview` | Serve the production bundle locally for smoke&ndash;testing.                 |
| `npm run lint`    | Run `tsc --noEmit` &mdash; pure type&ndash;check, no emit.                   |
| `npm run clean`   | Wipe `dist/` and any generated `server.js`.                                  |

---

## 📁 Project Structure

```
dark-portfolio-landing-page/
├─ public/                       # Favicons, manifest, static assets
├─ supabase/
│  └─ migrations/                # SQL migrations (background music, unified posts)
├─ src/
│  ├─ App.tsx                    # Router root, providers, route map
│  ├─ main.tsx                   # Vite entry
│  ├─ index.css                  # Tailwind v4 layer + design tokens
│  │
│  ├─ pages/
│  │  ├─ Home.tsx                # Hero • SelectedWorks • Journal • Explorations • Stats
│  │  ├─ Work.tsx                # Filterable grid of projects + activities
│  │  ├─ Resume.tsx              # Bio, skills, certifications, contact form
│  │  ├─ ProjectDetail.tsx       # Case-study layout
│  │  ├─ JournalDetail.tsx       # Long-form post
│  │  ├─ ActivityDetail.tsx      # Talks / community work
│  │  ├─ ExperienceDetail.tsx    # Work history entry
│  │  ├─ AcademicDetail.tsx      # Education entry
│  │  └─ BackOffice/             # The CMS — see "Back Office CMS"
│  │     ├─ index.tsx            # Shell + iframe live preview
│  │     ├─ Login.tsx            # Supabase auth
│  │     ├─ components/          # Sidebar, ArrayEditor, ImageUpload, AudioUpload …
│  │     └─ sections/            # One editor per content section
│  │
│  ├─ components/
│  │  ├─ Hero.tsx                # Headline, role rotator, aurora background
│  │  ├─ Aurora.tsx              # WebGL aurora (OGL)
│  │  ├─ Beams.tsx               # 3D light beams (R3F)
│  │  ├─ GlassSurface.tsx        # Reusable glassmorphism container
│  │  ├─ ShinyText.tsx           # Animated text shimmer
│  │  ├─ TextType.tsx            # Typewriter effect
│  │  ├─ LogoLoop.tsx            # Marquee of client logos
│  │  ├─ CountUp.tsx             # Animated stat counter
│  │  ├─ LoadingScreen.tsx       # Initial bootup overlay
│  │  ├─ Navbar.tsx              # Floating pill nav with music toggle
│  │  ├─ MusicToggle.tsx         # Play / pause control
│  │  ├─ MusicVisualizer.tsx     # Live waveform when playing
│  │  ├─ Contact.tsx             # CTA footer
│  │  └─ …                       # Stats, SelectedWorks, Journal, Explorations
│  │
│  ├─ contexts/
│  │  ├─ PortfolioDataContext.tsx# Fan-in fetch from Supabase + Realtime subs
│  │  └─ BackgroundMusicContext.tsx # Crossfaded ambient audio engine
│  │
│  ├─ data/                      # Fallback / type-only data shapes
│  └─ lib/
│     ├─ supabase.ts             # Client factory + safe storage delete
│     └─ types.ts                # Shared cross-section TypeScript types
│
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ vercel.json                   # SPA rewrites for client-side routing
└─ package.json
```

---

## 🧭 Routes

| Path                     | Component                | Description                                            |
|--------------------------|--------------------------|--------------------------------------------------------|
| `/`                      | `Home`                   | Hero, selected works, journal, explorations, stats.    |
| `/work`                  | `Work`                   | Grid of all projects + activities, filterable.         |
| `/resume`                | `Resume`                 | Bio, skills, certifications, CV download, contact form.|
| `/project/:id`           | `ProjectDetail`          | Full case study with metrics &amp; visuals.            |
| `/journal/:id`           | `JournalDetail`          | Long&ndash;form post.                                  |
| `/activity/:id`          | `ActivityDetail`         | Talks, workshops, community work.                      |
| `/experience/:id`        | `ExperienceDetail`       | Work history entry with responsibilities &amp; gallery.|
| `/academic/:id`          | `AcademicDetail`         | Degree / programme entry.                              |
| `/bts-porto/*`           | `BackOffice`             | CMS &mdash; requires Supabase auth.                    |
| `*`                      | `Navigate → /`           | Catch&ndash;all redirect to home.                      |

---

## 🛠️ Back Office CMS

Navigate to **`/bts-porto`** to open the back office. After signing in (Supabase Auth) you get an IDE&ndash;style three&ndash;pane layout:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Top bar  •  Portfolio CMS  •  DB Connected  •  user@email  •  Sign out  │
├──────────┬───────────────────────────────┬───────────────────────────────┤
│ Sidebar  │   Section editor              │   Live preview (iframe)       │
│          │                               │                               │
│ • Site   │   ┌───────────────────────┐   │   ┌─────────────────────┐     │
│ • Hero   │   │  Field  │ value       │   │   │                     │     │
│ • Proj.. │   │  Field  │ value       │   │   │   Public site here  │     │
│ • Posts  │   │  Field  │ value       │   │   │   auto-refreshes    │     │
│ • Exp..  │   └───────────────────────┘   │   │   on save           │     │
│ • Acad.. │   [ Save ]                    │   │                     │     │
│ • Stats  │                               │   └─────────────────────┘     │
└──────────┴───────────────────────────────┴───────────────────────────────┘
```

### Sections you can edit

| Section          | What lives there                                                       |
|------------------|------------------------------------------------------------------------|
| **Site Settings**| Collection label, logo initials, owner email, owner name.              |
| **Hero**         | Headline, tagline, description, CTA labels, aurora colors.             |
| **Navigation**   | Nav links + order.                                                     |
| **Projects**     | Case studies + tech stack + methodology phases + metrics + visuals.    |
| **Posts**        | Unified journal/activity entries with tags &amp; links.                |
| **Experience**   | Roles with responsibilities, technologies, metrics, gallery.           |
| **Academic**     | Degrees with activities, metrics, gallery.                             |
| **Stats**        | Animated counters on Home.                                             |
| **Explorations** | Two&ndash;column image grid.                                           |
| **Contact**      | CTA copy, social links, availability text.                             |
| **Resume**       | Bio, skills (3&ndash;column grouping), certifications, CV upload.      |

Every save triggers a Supabase Realtime event &mdash; the public site context refetches in milliseconds and the iframe shows the change without a manual refresh.

---

## 🗃️ Supabase Setup

1. **Create a new project** at [supabase.com](https://supabase.com) and copy the URL + anon key into your `.env`.
2. **Run the migrations** in [`supabase/migrations/`](supabase/migrations/) against your project (either via the Supabase CLI or by pasting them into the SQL editor in order):
   - `20260528_unified_posts.sql`
   - `20260528_background_music.sql`
3. **Create storage buckets** for media uploads. The CMS uploaders expect public buckets named (at minimum) `images` and `audio`. Adjust RLS policies to suit your auth model.
4. **Create your first user** in **Authentication → Users** &mdash; that&rsquo;s the account you&rsquo;ll log into `/bts-porto` with.
5. **(Optional) Lock down RLS** so that only authenticated users can write, while `anon` may read public content. The realtime subscriptions in [`PortfolioDataContext.tsx`](src/contexts/PortfolioDataContext.tsx) work fine with read&ndash;only anon access.

> 🔁 **Realtime tables watched:** 29 tables &mdash; see the `WATCHED_TABLES` array in [`PortfolioDataContext.tsx:702`](src/contexts/PortfolioDataContext.tsx#L702) for the canonical list.

---

## 🎨 Customization Guide

### Design tokens

Tweak the dark palette and typography in [`src/index.css`](src/index.css):

```css
@layer base {
  :root {
    --bg:      0 0% 4%;
    --surface: 0 0% 8%;
    --text:    0 0% 96%;
    --muted:   0 0% 53%;
    --stroke:  0 0% 12%;
    --accent:  0 0% 96%;
  }
}

@theme {
  --font-body:    'Inter', sans-serif;
  --font-display: 'Instrument Serif', serif;
}
```

The accent gradient (`#89AACC → #4E85BF`) used on buttons, borders, and focus rings lives in the same file under `.accent-gradient` and `.accent-gradient-border`.

### Aurora colors

Open the **Hero** section in the CMS and adjust **Aurora Color 1/2/3** &mdash; or edit the defaults in [`PortfolioDataContext.tsx`](src/contexts/PortfolioDataContext.tsx).

### Background music

Upload an audio file from the **Site Settings** section in the CMS, or drop one into the `audio` Supabase bucket and reference it from the `site_settings` row. The [`BackgroundMusicProvider`](src/contexts/BackgroundMusicContext.tsx) handles crossfading and the toggle inside [`Navbar`](src/components/Navbar.tsx).

---

## ☁️ Deployment

This project ships with a [`vercel.json`](vercel.json) and is **one&ndash;click&ndash;deployable** to Vercel.

### Deploy to Vercel

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in **Project Settings → Environment Variables**.
4. Hit **Deploy**.

Vercel will run `npm run build` and serve `dist/`. The SPA rewrites in `vercel.json` make sure deep links like `/project/some-slug` resolve correctly on hard refresh.

### Self&ndash;hosting

Any static host works (Netlify, Cloudflare Pages, S3 + CloudFront, Caddy, nginx). Just make sure the host falls back to `index.html` for unknown paths so client&ndash;side routing keeps working.

---

## 🧭 Roadmap

- [ ] i18n &mdash; bilingual (EN / ID) toggle.
- [ ] OG image generator per project / post.
- [ ] MDX support for journal entries.
- [ ] Search across projects + posts.
- [ ] PWA install prompt.
- [ ] Storybook for component documentation.

Have an idea? Open an issue &mdash; see below.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repo and create a feature branch: `git checkout -b feat/your-thing`.
2. Run `npm run lint` to keep types clean.
3. Commit using Conventional Commits where you can (`feat:`, `fix:`, `chore:` …).
4. Open a PR describing **what changed** and **why**.

---

## 📄 License

Released under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 🙏 Acknowledgments

- [**OGL**](https://github.com/oframe/ogl) &mdash; the lightweight WebGL library powering the aurora.
- [**GSAP**](https://gsap.com) &mdash; the gold standard for timeline&ndash;based animation.
- [**Framer Motion**](https://www.framer.com/motion/) &mdash; spring physics and layout animations.
- [**Supabase**](https://supabase.com) &mdash; Postgres, Auth, Storage, and Realtime in one box.
- [**Vercel**](https://vercel.com) &mdash; hosting, analytics, and Speed Insights.
- [**Lucide**](https://lucide.dev) &mdash; the icon set used throughout the CMS.
- The broader React, Vite, Tailwind, and Three.js communities &mdash; this project stands on their shoulders.

<br />

<div align="center">

<sub>Crafted with care in the dark. &nbsp;✦</sub>

</div>
