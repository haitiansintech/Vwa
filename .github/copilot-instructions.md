<!-- Short, focused instructions for AI coding agents working on Vwa -->

# Vwa — Copilot instructions (concise)

This file contains the essential, actionable information an AI coding agent needs to be productive in this repository.

1. Project overview
   - Next.js 14 app using the `app/` router. Main UI lives under `app/` with a language segment `app/[lang]/`.
   - Content for blog/docs uses MDX + Contentlayer (`content/` + `contentlayer` integration in `next.config.mjs`).
   - Auth: NextAuth.js with Prisma adapter. Prisma client is in `lib/db.ts` (dev global caching pattern).
   - Email: Postmark client is used in `lib/auth.ts` for sign-in/activation emails.
   - Payments: Stripe webhooks implemented under `app/api/webhooks/stripe/route.ts` and `lib/stripe.ts`.

2. Key developer workflows (commands)
   - Install: prefer pnpm or npm; repo uses package.json scripts. Typical local flow:
     - Install deps: `npm install` (README uses npm; pnpm also supported if you prefer)
     - Dev: `npm run dev` (starts Next dev server)
     - Build: `npm run build` (runs `contentlayer build && next build`)
     - Preview/start: `npm run preview` / `npm run start`
     - Postinstall: Prisma codegen runs via `prisma generate` (see `postinstall` script)
     - Typecheck: `npm run check:types` (tsc --noEmit)

3. Environment and secrets
   - Environment variables are validated via `env.mjs` using `@t3-oss/env-nextjs`. Use `.env.local` populated from `.env.example`.
   - Important vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, GitHub OAuth keys, Postmark tokens, Stripe keys.
   - For local Prisma dev, run `npx prisma migrate dev` or point to a dev DB (PlanetScale in production).

4. Routing and middleware patterns
   - i18n routing: middleware in `middleware.ts` enforces a language segment (`/en` or `/ht`) and stores lang cookie `i18next` (`app/i18n/settings.ts`). Follow `app/[lang]/...` structure.
   - Protected routes: middleware uses `next-auth` token checks; auth pages (`/login`, `/register`) redirect when authenticated.
   - API: Route handlers follow the Next 14 `app/api/.../route.ts` pattern (see `app/api/webhooks/stripe/route.ts`).

5. Data and integration points
   - Prisma: schema in `prisma/schema.prisma`. DB client exported as `db` from `lib/db.ts` (use `db` directly in server-side code).
   - Contentlayer: content types generated into `.contentlayer/generated` (tsconfig paths). Always run `contentlayer build` before `next build`.
   - Stripe: server-side `lib/stripe.ts` wrapper used by webhook and subscription flows. Webhook signature check in `app/api/webhooks/stripe/route.ts`.
   - NextAuth: `lib/auth.ts` exports `authOptions`. Use `getServerSession(authOptions)` for server session lookups (see `lib/session.ts`).

6. UI and patterns
   - UI components follow the `components/` and `components/ui/` patterns (Radix + Tailwind). Prefer exported primitives (e.g., `components/ui/button.tsx`).
   - Styling: Tailwind configured in `tailwind.config.js` and global styles in `styles/globals.css`.
   - Fonts: Next font usage in `app/[lang]/layout.tsx` demonstrates `next/font` and local fonts.

7. Conventions and gotchas
   - Use server components for data fetching in `app/` routes unless a client interaction is required. Files named with `'use client'` are client components.
   - Prisma dev client caching pattern: `lib/db.ts` stores a global `cachedPrisma` in non-production to avoid connection issues in dev.
   - Email templates: Postmark template IDs are stored in env vars and treated as required by `env.mjs`.
   - Contentlayer must be built prior to a Next build; CI should run `npm run build` which runs both.
   - Next 14 specifics: OG generation uses `@vercel/og` for images; there are known Next issues with catch-all OG routes (see README known issues).

8. Where to look for examples
   - Auth flows: `lib/auth.ts`, `lib/session.ts`, `app/api/auth/*`
   - Stripe webhook: `app/api/webhooks/stripe/route.ts`
   - i18n & middleware: `middleware.ts`, `app/i18n/settings.ts`, `app/[lang]/layout.tsx`
   - Contentlayer usage & MDX: `content/`, `next.config.mjs`, `tsconfig.json` (paths)

If anything above is unclear or you want more detail (CI, commit hooks, or specific API shapes), tell me which area to expand and I will iterate.
