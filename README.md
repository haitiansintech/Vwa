# Vwa

A free civic platform helping Haitians in the diaspora understand and participate in Haiti's historic election.

## About

Vwa (Creole for "voice") is a nonpartisan civic resource built for the Haitian diaspora. It helps users understand what is at stake in Haiti's 2025 election, check their eligibility to participate, navigate documentation requirements, and stay informed as the process develops.

The platform is bilingual (English and Haitian Creole) and designed for accessibility across devices and connection speeds.

## Stack

- **Framework** — Next.js 14 App Router, React 18, TypeScript
- **Styling** — Tailwind CSS, Radix UI, shadcn/ui
- **Content** — Velite (MDX compilation), bilingual via `[lang]` route segment
- **Database** — Prisma ORM, MySQL (PlanetScale-compatible)
- **Auth** — NextAuth.js (admin routes only; no public login required)
- **Email** — Postmark (subscriber notifications)
- **Payments** — Stripe (one-time donations, optional)
- **Analytics** — Vercel Analytics with typed event abstraction
- **Package manager** — pnpm (required — see note below)

## Routes

| Path | Description |
|---|---|
| `/[lang]` | Homepage — hero, stats, eligibility preview, content cards, email capture |
| `/[lang]/eligibility` | Multi-step eligibility checker |
| `/[lang]/eligibility/result` | Eligibility result + next steps |
| `/[lang]/why-this-election-matters` | Editorial context |
| `/[lang]/resources` | Resource index |
| `/[lang]/resources/documentation` | Documentation guide |
| `/[lang]/timeline` | Election timeline |
| `/[lang]/about` | About Vwa |
| `/[lang]/support` | Support / donate page |
| `/admin` | Protected admin area (NextAuth required) |

Supported languages: `en` (English), `ht` (Haitian Creole). Language is detected from the URL path, cookie, or `Accept-Language` header.

## Running Locally

### Requirements

- Node.js 18+
- pnpm 8+ (`npm install -g pnpm`)
- A MySQL database (local or PlanetScale)

### Setup

1. Install dependencies with pnpm:

```sh
pnpm install
```

> **Important:** This project must be run with pnpm, not npm. pnpm manages the
> node_modules structure using its virtual store. Running scripts with npm will
> cause module resolution failures in velite's config compilation on Windows.

2. Copy `.env.example` to `.env.local` and fill in required values:

```sh
cp .env.example .env.local
```

Required:
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=
```

Optional (features degrade gracefully when absent):
```
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
POSTMARK_API_TOKEN=
POSTMARK_SIGN_IN_TEMPLATE=
POSTMARK_ACTIVATION_TEMPLATE=
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=
```

3. Run database migrations:

```sh
npx prisma migrate dev
```

4. Start the development server:

```sh
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000). It redirects to `/en` by default.

### Content watching (optional)

To get live MDX reloads while editing content files, run velite in watch mode in a second terminal:

```sh
pnpm dev:content
```

### Other scripts

| Command | Description |
|---|---|
| `pnpm dev` | Build content once, then start Next.js dev server |
| `pnpm dev:content` | Watch MDX content files and rebuild on change |
| `pnpm build` | Production build (velite + next build) |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint |
| `pnpm check:types` | TypeScript type check (no emit) |
| `pnpm preview` | Full production build and local preview |

## Project Structure

```
app/
  [lang]/
    (marketing)/     # Public-facing pages
    (docs)/          # Documentation layout
components/          # Shared UI components
content/
  pages/             # MDX static pages
  resources/         # MDX resource and explainer content
lib/                 # Utilities (auth, analytics, db, utils)
prisma/
  schema.prisma      # Database schema
public/
  images/            # Static images (hero, etc.)
types/               # Shared TypeScript types
velite.config.ts     # Content collection definitions
```

## Content

All editorial content lives in `content/` as MDX files. Velite compiles them into `.velite/` (auto-generated, never edit directly). Next.js pages import from `.velite/` — they never read MDX files at runtime.

### Collections

| Collection | Directory | Used for |
|---|---|---|
| `allPages` | `content/pages/` | Static pages: about, privacy, terms, why-this-election-matters |
| `allResources` | `content/resources/` | Explainers and guides: documentation, voter registration, etc. |

### Frontmatter

**Pages** (`content/pages/`):
```mdx
---
title: Why This Election Matters
description: The historical context behind Haiti's 2025 election.
---

Your content here...
```

**Resources** (`content/resources/`):
```mdx
---
title: Documentation Guide
description: What documents you may need to participate.
category: documents
---

Your content here...
```

The `category` field is optional and can be used for filtering on the resources index.

### Slugs

Slugs are derived automatically from the file path:

- `content/pages/about.mdx` → slug `/about`
- `content/resources/documentation.mdx` → slug `/resources/documentation`

### Editing content during development

**One-off edit** — just restart the dev server; velite runs at startup:
```sh
pnpm dev
```

**Active content session** — run velite in watch mode in a second terminal so edits hot-reload immediately:
```sh
# Terminal 1
pnpm dev

# Terminal 2
pnpm dev:content
```

Save an MDX file → velite recompiles → Next.js picks up the change automatically.

### Adding a new page

1. Create `content/pages/your-slug.mdx` with the required frontmatter
2. Create the corresponding route at `app/[lang]/(marketing)/your-slug/page.tsx`
3. Import and render the compiled body from `.velite/`

### What not to edit

- `.velite/` — wiped and regenerated on every velite build
- `public/static/` — velite copies linked assets here automatically

## Data Models

- **Subscriber** — email capture with source tracking
- **Donation** — one-time donation records (Stripe-backed, optional)
- **Issue** — civic issues (stub, for future editorial use)
- **Person** — candidate/figure profiles (stub)
- **Institution** — institutional profiles (stub)
- **TimelineEntry** — election timeline entries

## License

MIT
