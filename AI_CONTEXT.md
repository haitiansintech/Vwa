# AI_CONTEXT

## Purpose
An open source application built to inform and mobilize Haitians through civic engagement. Provides multilingual content (i18n ready) with authentication, subscriptions, and content management capabilities.

## Stack
- Language: TypeScript
- Framework: Next.js 14 (using App Router with `/app` directory)
- Package manager: pnpm
- Runtime: Node.js
- DB: MySQL (via Prisma ORM)
- Key libraries:
  - NextAuth.js (authentication)
  - Prisma (ORM)
  - Stripe (subscriptions)
  - Contentlayer (MDX content)
  - Radix UI (UI components)
  - Tailwind CSS (styling)
  - i18next (internationalization)
  - Zod (validation)
  - EditorJS (content editor)

## Key folders
- `app/`: Next.js 14 App Router structure
  - `app/[lang]/`: Internationalized routes with language parameter
    - `(auth)/`: Authentication pages
    - `(dashboard)/`: Dashboard pages
    - `(docs)/`: Documentation pages
    - `(editor)/`: Content editor pages
    - `(marketing)/`: Marketing pages
  - `app/api/`: API routes
  - `app/i18n/`: i18n configuration and locale files
- `components/`: React components (UI components in `components/ui/`)
- `lib/`: Utility functions and shared logic (auth, db, stripe, validations)
- `config/`: Configuration files (dashboard, docs, marketing, site, subscriptions)
- `content/`: MDX content (authors, blog, docs, guides, pages)
- `prisma/`: Database schema and migrations
- `types/`: TypeScript type definitions
- `hooks/`: React hooks
- `styles/`: Global styles

## How to run
- Install: `npm install`
- Dev: `npm run dev`
- Test: (not configured)
- Lint: `npm run lint`
- Typecheck: `npm run check:types`
- Build: `npm run build` (runs contentlayer build then next build)

## Environment variables
- Required:
  - `DATABASE_URL`: MySQL database connection string
  - `NEXTAUTH_URL`: Application URL for NextAuth
  - `NEXTAUTH_SECRET`: Secret for NextAuth session encryption
- Optional:
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_ACCESS_TOKEN`: GitHub OAuth
  - `POSTMARK_API_TOKEN`, `POSTMARK_SIGN_IN_TEMPLATE`, `POSTMARK_ACTIVATION_TEMPLATE`: Email via Postmark
  - `SMTP_FROM`: Email sender address
  - `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_MONTHLY_PLAN_ID`: Stripe subscriptions
  - `NEXT_PUBLIC_APP_URL`: Public app URL
- Where to configure: `.env.local` (copy from `.env.example`)

## Architecture notes
- Important patterns used:
  - Next.js 14 App Router with route groups for logical separation
  - i18n via `[lang]` dynamic route parameter with i18next
  - Server and Client Components pattern
  - Prisma for type-safe database access
  - NextAuth.js with Prisma adapter for authentication
  - Contentlayer for type-safe MDX content
  - Radix UI primitives with custom styling
- Anything surprising:
  - Project forked from Taxonomy OSS template
  - Database provider is MySQL (not PostgreSQL despite .env.example showing postgres URL format)
  - Uses route groups extensively: `(auth)`, `(dashboard)`, `(docs)`, `(editor)`, `(marketing)`
- Areas under active refactor:
  - Dashboard features not yet in use (per README warning)
- Known pain points:
  - Cannot use opengraph-image.tsx inside catch-all routes (Next.js issue #48162)
  - Performance hits expected in dashboard due to earlier Next.js 13/React 18 unstable releases (now on Next.js 14)
  - Stripe-related code exists due to the Taxonomy OSS template.
- Billing and subscription features are NOT currently part of the VWA product PRD.
- Stripe code paths are dormant and should not be extended without an explicit product decision.

