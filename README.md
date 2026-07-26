# BiznesiYt.al — MVP

Platformë AI Business Advisor për biznese të vogla dhe mesatare në Shqipëri.

## Setup

### 1. Environment Variables

Krijoni skedarin `.env` nga `.env.example`:

```bash
cp .env.example .env
```

Plotësoni vlerat:
```
VITE_SUPABASE_URL=https://iwwezuucbplzwupcakrl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ja6Lz8NfRAXDpKl12ALDpg_HWgLY9Qd
ANTHROPIC_API_KEY=<your-anthropic-key>
```

### 2. Supabase Database Setup

✅ **Skema është aplikuar tashmë** te projekti `Biznesi Yt` (`iwwezuucbplzwupcakrl`).
Tabelat: `users_profile`, `conversations`, `messages`, `daily_tips` — të gjitha me RLS aktive.

### 3. Supabase Auth Setup

Në Supabase Dashboard:
- Authentication → Providers → Email (aktivizoni "Confirm email" opsionalisht)
- Authentication → Providers → Google (aktivizoni me Client ID/Secret nga Google Cloud)
- Authentication → URL Configuration: `Site URL = https://biznesiytal.vercel.app`

### 4. Install & Run

```bash
npm install
npm run dev
```

### 5. Deploy në Vercel

```bash
npm run build
vercel deploy
```

Vendosni environment variables në Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend/Auth/DB:** Supabase (PostgreSQL, Auth, RLS)
- **AI:** Anthropic Claude API (claude-sonnet-4-6)
- **Hosting:** Vercel

## Struktura

```
src/
├── contexts/        # AuthContext
├── components/      # Layout, ProtectedRoute, UI components
├── pages/
│   ├── auth/        # Login, Register
│   ├── marketing/   # Plan, Content Creator, Competitor
│   ├── financial/   # Placeholder
│   ├── legal/       # Placeholder
│   ├── growth/      # Placeholder
│   ├── LandingPage.jsx
│   ├── OnboardingPage.jsx
│   ├── DashboardPage.jsx
│   ├── ChatPage.jsx
│   └── SettingsPage.jsx
└── lib/             # supabase.js, utils.js
api/
├── chat.js          # Anthropic streaming proxy
└── daily-tip.js     # Daily tip generator
supabase/
└── schema.sql       # Full DB schema + RLS + triggers
```
