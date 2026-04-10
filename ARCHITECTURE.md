# Technical Architecture — Vwa

> An open-source Next.js 14 application built to inform and mobilize Haitians.
> Stack: Next.js · TypeScript · Prisma · MySQL · NextAuth · Velite · Tailwind CSS · Stripe · i18next

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Top-Level Directory Structure](#2-top-level-directory-structure)
3. [Next.js App Router Layout](#3-nextjs-app-router-layout)
4. [Routing & Middleware](#4-routing--middleware)
5. [Authentication](#5-authentication)
6. [Database Layer](#6-database-layer)
7. [API Routes](#7-api-routes)
8. [Content Management (Velite + MDX)](#8-content-management-velite--mdx)
9. [Internationalization](#9-internationalization)
10. [UI Component Architecture](#10-ui-component-architecture)
11. [Payments & Subscriptions](#11-payments--subscriptions)
12. [Environment Variables](#12-environment-variables)
13. [MCP Server](#13-mcp-server)
14. [Utilities & Shared Logic](#14-utilities--shared-logic)
15. [Tooling & Configuration](#15-tooling--configuration)
16. [Key Architectural Patterns](#16-key-architectural-patterns)
17. [Dependency Map](#17-dependency-map)

---

## 1. Project Overview

Vwa is forked from [shadcn/taxonomy](https://github.com/shadcn/taxonomy) and extended into a bilingual (English / Haitian Creole) platform. It combines a public-facing marketing and documentation site with a protected user dashboard, a rich-text post editor, and a Stripe-gated subscription model.

| Attribute | Value |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Package manager | pnpm |
| Database | MySQL via Prisma ORM |
| Auth | NextAuth v4 (GitHub OAuth + Magic Link) |
| Content | Velite (MDX compilation) |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix UI) |
| Payments | Stripe |
| Email | Postmark |
| i18n | i18next (en, ht) |
| Deployment target | Vercel |

---

## 2. Top-Level Directory Structure

```
Vwa/
├── app/                  # Next.js 14 App Router (routes, layouts, API handlers)
├── components/           # React components (~69 files)
│   └── ui/               # shadcn/ui base primitives
├── config/               # Static configuration objects (site, nav, subscriptions)
├── content/              # MDX source files (docs, guides, blog, authors, pages)
├── hooks/                # Custom React hooks
├── lib/                  # Business logic utilities (auth, db, stripe, toc, utils)
├── mcp/                  # Model Context Protocol server
├── prisma/               # Prisma schema + migrations
├── public/               # Static assets
├── styles/               # Global CSS
├── types/                # TypeScript type definitions & augmentations
├── .velite/              # Velite build output (generated, gitignored)
├── .next/                # Next.js build output (generated, gitignored)
├── velite.config.ts      # Velite content collections config
├── next.config.mjs       # Next.js config (Velite plugin, image domains)
├── middleware.ts          # Language detection + auth redirects
├── env.mjs               # Environment variable validation (@t3-oss/env-nextjs)
├── tailwind.config.js    # Tailwind + plugin config
├── tsconfig.json         # TypeScript config (path aliases, strict mode)
├── .npmrc                # pnpm config (shamefully-hoist=true for Turbopack)
└── package.json          # Dependencies + scripts
```

---

## 3. Next.js App Router Layout

All user-facing routes live under the dynamic `[lang]` segment, enabling first-class i18n at the routing layer. Route groups provide layout isolation without affecting URL structure.

```
app/
├── [lang]/
│   ├── layout.tsx                         # Root layout: fonts, providers, analytics
│   │
│   ├── (marketing)/                       # Public marketing site
│   │   ├── layout.tsx                     # Header + footer wrapper
│   │   ├── page.tsx                       # Home page
│   │   ├── [...slug]/page.tsx             # Dynamic MDX pages (about, privacy, etc.)
│   │   ├── blog/
│   │   │   ├── page.tsx                   # Blog listing
│   │   │   └── [...slug]/page.tsx         # Blog post detail
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   └── future/page.tsx
│   │
│   ├── (auth)/                            # Unauthenticated auth pages
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/                       # Protected user area
│   │   ├── layout.tsx                     # Auth guard + dashboard shell
│   │   └── dashboard/
│   │       ├── page.tsx                   # Post listing
│   │       ├── layout.tsx
│   │       ├── billing/page.tsx           # Stripe billing portal
│   │       └── settings/page.tsx          # User profile settings
│   │
│   ├── (docs)/                            # Documentation & guides
│   │   ├── layout.tsx
│   │   ├── docs/
│   │   │   ├── layout.tsx                 # Sidebar navigation
│   │   │   └── [[...slug]]/page.tsx       # Catch-all MDX doc renderer
│   │   └── guides/
│   │       ├── layout.tsx
│   │       ├── page.tsx                   # Guides listing
│   │       └── [...slug]/page.tsx         # Guide detail
│   │
│   └── (editor)/                          # Content editor
│       ├── layout.tsx
│       └── editor/
│           └── [postId]/page.tsx          # Editor.js rich-text editor
│
├── api/
│   ├── auth/[...nextauth]/route.ts        # NextAuth handler
│   ├── posts/route.ts                     # GET list, POST create
│   ├── posts/[postId]/route.ts            # PATCH update, DELETE
│   ├── users/[userId]/route.ts            # GET/PATCH user profile
│   ├── users/stripe/route.ts              # Stripe checkout / portal
│   └── webhooks/stripe/route.ts           # Stripe event processing
│
└── og/route.tsx                           # OG image generation (@vercel/og)
```

### Layout Composition

Each route group defines an isolated layout, composing from outer to inner:

```
Root [lang] layout
  └── (marketing) layout  [Header + Footer]
        └── page or slug route

  └── (auth) layout       [Centered card]
        └── login / register

  └── (dashboard) layout  [Auth guard + nav shell]
        └── dashboard layout
              └── billing / settings / post list

  └── (docs) layout
        └── docs layout   [Sidebar nav]
              └── [[...slug]] MDX renderer
```

---

## 4. Routing & Middleware

**File:** `middleware.ts`

The middleware intercepts every non-asset request and performs two responsibilities in sequence:

### 4.1 Language Detection & Redirect

Priority order for language resolution:
1. URL path prefix (`/en/...` or `/ht/...`)
2. `i18next` cookie value
3. `Accept-Language` request header (parsed with `accept-language`)
4. Fallback: `en`

If the resolved language is not already present in the URL path, the middleware issues a redirect to `/{lang}{pathname}` and sets the `i18next` cookie.

### 4.2 Authentication Guards

Protected path prefixes: `/dashboard`, `/editor`

- If the user has no valid NextAuth JWT, they are redirected to `/login?from={originalPath}`.
- The `from` parameter is consumed post-login to restore the original destination.

### 4.3 Matcher Config

```ts
matcher: [
  '/((?!api|_next/static|_next/image|favicon.ico).*)',
]
```

Static assets, API routes, and Next.js internals bypass the middleware entirely.

---

## 5. Authentication

**Files:** `lib/auth.ts`, `lib/session.ts`, `types/next-auth.d.ts`

### 5.1 NextAuth Configuration

| Setting | Value |
|---|---|
| Session strategy | JWT |
| Database adapter | `@next-auth/prisma-adapter` |
| Sign-in page | `/login` |

### 5.2 Providers

**GitHub OAuth**
- Env: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Scope: read user profile

**Email Magic Link (Postmark)**
- Env: `POSTMARK_API_TOKEN`, `SMTP_FROM`
- Two Postmark templates:
  - `POSTMARK_SIGN_IN_TEMPLATE` — for verified returning users
  - `POSTMARK_ACTIVATION_TEMPLATE` — for first-time / unverified users

### 5.3 JWT & Session Callbacks

```
jwt callback:
  → fetch User from DB by email
  → return { id, name, email, image }

session callback:
  → attach user.id to session.user
  → exposes session.user.id in client + server components
```

### 5.4 Type Augmentation

`types/next-auth.d.ts` extends `Session.user` and `JWT` with `id: string`.

### 5.5 Server-Side Session Helper

`lib/session.ts` exports `getCurrentUser()`:
```ts
async function getCurrentUser(): Promise<User | undefined>
```
Used in server components and API routes to retrieve the authenticated user without a round-trip through the NextAuth session endpoint.

---

## 6. Database Layer

**Files:** `prisma/schema.prisma`, `lib/db.ts`

### 6.1 Provider

MySQL, connection string via `DATABASE_URL`.

### 6.2 Prisma Client Singleton

`lib/db.ts` exports a singleton `db` instance. In development the client is cached on the global object to prevent connection exhaustion from hot reloads.

### 6.3 Schema

#### User
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String? | |
| email | String? | Unique |
| emailVerified | DateTime? | |
| image | String? | |
| stripeCustomerId | String? | Unique |
| stripeSubscriptionId | String? | Unique |
| stripePriceId | String? | |
| stripeCurrentPeriodEnd | DateTime? | |
| createdAt / updatedAt | DateTime | Auto-managed |

Relations: `Account[]`, `Session[]`, `Post[]`

#### Account (OAuth accounts)
Stores OAuth provider tokens. Composite unique on `(provider, providerAccountId)`.

#### Session
Standard NextAuth sessions table with `sessionToken` (unique).

#### VerificationToken
Email magic-link tokens. Composite unique on `(identifier, token)`.

#### Post (User-created content)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| title | String | Default: "Untitled Post" |
| content | Json? | Editor.js block JSON |
| published | Boolean | Default: false |
| authorId | String | FK → User |
| createdAt / updatedAt | DateTime | Auto-managed |

### 6.4 Entity Relationship

```
User ─┬─< Account       (one user, many OAuth accounts)
      ├─< Session        (one user, many sessions)
      └─< Post           (one user, many posts)

VerificationToken        (standalone, no relations)
```

---

## 7. API Routes

All handlers are Next.js Route Handlers (`route.ts`). Every protected endpoint calls `getCurrentUser()` and returns `403` if unauthenticated.

### 7.1 Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | Required | List calling user's posts |
| POST | `/api/posts` | Required | Create post (free plan: max 3) |
| PATCH | `/api/posts/[postId]` | Required + owner | Update title / content |
| DELETE | `/api/posts/[postId]` | Required + owner | Delete post |

Post creation enforces the subscription gate:
- Free users: maximum 3 posts
- Pro users: unlimited
- Returns `402 Payment Required` + `RequiresProPlanError` when limit exceeded

### 7.2 Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/[userId]` | Required | Fetch user profile |
| PATCH | `/api/users/[userId]` | Required + self | Update name |
| GET | `/api/users/stripe` | Required | Create Stripe checkout or portal session |

### 7.3 Webhooks

| Method | Path | Notes |
|---|---|---|
| POST | `/api/webhooks/stripe` | Verified via Stripe signature |

Handled events:
- `checkout.session.completed` — writes initial subscription data to User
- `invoice.payment_succeeded` — updates `stripeCurrentPeriodEnd` on renewal

### 7.4 OG Image

`GET /api/og` — Generates dynamic Open Graph images using `@vercel/og` (Edge runtime).

---

## 8. Content Management (Velite + MDX)

**Files:** `velite.config.ts`, `components/mdx-components.tsx`

### 8.1 Why Velite

`next-contentlayer` was archived (May 2024) and is incompatible with Turbopack. Velite is its actively-maintained successor with identical API ergonomics and full Turbopack support.

### 8.2 Collections

Defined in `velite.config.ts` with output aliased to `#velite`:

| Collection | Pattern | Key Fields |
|---|---|---|
| `allDocs` | `docs/**/*.mdx` | title, description, date, published, body, raw, slug, slugAsParams |
| `allGuides` | `guides/**/*.mdx` | title, description, date, published, featured, body, raw, slug, slugAsParams |
| `allPosts` | `blog/**/*.mdx` | title, description, date, published, image, authors[], body, raw, slug, slugAsParams |
| `allAuthors` | `authors/**/*.mdx` | title, description, avatar, twitter, body, slug |
| `allPages` | `pages/**/*.mdx` | title, description, body, slug |

**Field notes:**
- `body` — `s.mdx()` → compiled MDX string (executed client-side via `new Function(code)`)
- `raw` — `s.raw()` → raw markdown text (used for TOC generation)
- `slug` — `s.path().transform(v => `/${v}`)` → full path with leading slash
- `slugAsParams` — path segments after the first (for route matching)

### 8.3 MDX Processing Pipeline

```
Source .mdx file
  → remark-gfm          (GFM: tables, strikethrough, task lists, autolinks)
  → rehype-slug         (adds id attributes to h1–h6)
  → rehype-pretty-code  (syntax highlighting, github-dark theme)
  → rehype-autolink-headings  (anchor links on headings, class: subheading-anchor)
  → compiled MDX string in .velite/
```

### 8.4 MDX Component Rendering

`components/mdx-components.tsx` (Client Component) provides the `Mdx` component:

```tsx
// Compiled MDX string → React component via new Function(code)
function useMDXComponent(code: string): React.ComponentType
```

Custom component overrides passed to MDX renderer:
`Image`, `Callout`, `Card`, `MdxCard`, `LinkedCard`, `Step`, `Steps`

### 8.5 Table of Contents

`lib/toc.ts` parses the `raw` markdown field using `remark` + `mdast-util-toc` to extract a heading tree, then rendered by `components/toc.tsx`.

### 8.6 Build Integration

Velite runs as a webpack plugin in `next.config.mjs`:
```js
webpack: (config) => {
  config.plugins.push(new (require("velite").VeliteWebpackPlugin)())
  return config
}
```

For development with watch mode: `npm run dev:content` (`velite --watch`).

---

## 9. Internationalization

**Files:** `app/i18n/`, `middleware.ts`

### 9.1 Supported Locales

| Code | Language |
|---|---|
| `en` | English (fallback) |
| `ht` | Haitian Creole |

### 9.2 Translation Files

```
app/i18n/locales/
├── en/translation.json
└── ht/translation.json
```

Single namespace: `translation`. Keys are flat strings (not nested objects).

### 9.3 Server Components

```ts
// app/i18n/index.ts
const { t, i18n } = await getTranslation(lang, 'translation')
```

Uses `i18next-resources-to-backend` to lazy-load locale JSON on the server.

### 9.4 Client Components

```ts
// app/i18n/client.ts
const { t } = useTranslation(lang, 'translation')
```

Auto-detects language from: URL path → HTML lang attribute → cookie → browser navigator.

### 9.5 Language Switcher

`components/LanguageSwitcher.tsx` updates the URL path prefix and sets the `i18next` cookie for persistence.

---

## 10. UI Component Architecture

**Directory:** `components/`

### 10.1 Primitive Layer (shadcn/ui)

Located in `components/ui/`. Each component is a thin, fully-typed wrapper around a Radix UI primitive, styled with Tailwind CSS class variants (`class-variance-authority`).

Available primitives: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, button, calendar, card, checkbox, collapsible, command, context-menu, dialog, dropdown-menu, form, hover-card, input, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, sheet, skeleton, slider, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip.

### 10.2 Custom Components

| Category | Components |
|---|---|
| Layout | `shell`, `header`, `footer`, `nav` |
| Navigation | `main-nav`, `mobile-nav`, `sidebar-nav`, `dashboard-nav` |
| Content | `mdx-components`, `callout`, `pager`, `toc`, `mdx-card` |
| Features | `editor`, `post-item`, `post-create-button`, `post-operations`, `billing-form`, `user-auth-form`, `user-name-form` |
| Search | `search` (cmdk command palette) |
| Theme | `theme-provider`, `mode-toggle` |
| i18n | `LanguageSwitcher` |
| Analytics | `analytics` (Vercel Analytics) |

### 10.3 Styling System

```
CSS Variables (HSL)     → Tailwind config resolves to utilities
Tailwind utilities      → Applied in components via cn()
class-variance-authority → Typed variant props on compound components
tailwind-merge          → Safe class deduplication in cn()
clsx                    → Conditional class composition
```

Dark mode is class-based (`dark:` prefix), toggled by `next-themes` through `ThemeProvider`.

---

## 11. Payments & Subscriptions

**Files:** `lib/stripe.ts`, `lib/subscription.ts`, `config/subscriptions.ts`, `lib/exceptions.ts`

### 11.1 Plans

| Plan | Price | Post Limit |
|---|---|---|
| Free | $0 | 3 posts |
| Pro | Configurable (Stripe) | Unlimited |

### 11.2 Subscription Check

`lib/subscription.ts` → `getUserSubscriptionPlan(userId)`:

1. Fetch `User` from DB, read Stripe fields
2. If `stripeCurrentPeriodEnd` is in the future → user is on Pro
3. Returns merged plan object: `{ ...freePlan | ...proPlan, stripeCustomerId, isCanceled, ... }`

### 11.3 Stripe Flows

**New subscription:** `/api/users/stripe` creates a Stripe Checkout session and redirects.

**Manage subscription:** Same endpoint detects existing customer and opens Stripe Customer Portal.

**Webhook processing:** `/api/webhooks/stripe` writes subscription state back to the User row after Stripe events.

### 11.4 Post Limit Enforcement

`POST /api/posts` calls `getUserSubscriptionPlan` and counts existing posts. If count ≥ 3 and not Pro, throws `RequiresProPlanError` → 402 response.

---

## 12. Environment Variables

**File:** `env.mjs` (validated with `@t3-oss/env-nextjs` + Zod)

Imported at the top of `next.config.mjs` to force validation at build time — missing variables cause the build to fail with a descriptive error.

### Server-Side (never exposed to the browser)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string (Prisma) |
| `NEXTAUTH_SECRET` | JWT encryption key |
| `NEXTAUTH_URL` | Canonical app URL (optional in dev) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `GITHUB_ACCESS_TOKEN` | GitHub API token (star count, etc.) |
| `SMTP_FROM` | Email sender address |
| `POSTMARK_API_TOKEN` | Postmark API key |
| `POSTMARK_SIGN_IN_TEMPLATE` | Magic link template ID (existing user) |
| `POSTMARK_ACTIVATION_TEMPLATE` | Magic link template ID (new user) |
| `STRIPE_API_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `STRIPE_PRO_MONTHLY_PLAN_ID` | Stripe Price ID for Pro monthly plan |

### Public (safe for browser)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Canonical URL used in client-side absolute URLs |

---

## 13. MCP Server

**File:** `mcp/vwa-mcp-server.ts`
**Run:** `npm run mcp:vwa` → `tsx mcp/vwa-mcp-server.ts`

### Purpose

Exposes repository context to AI agents and IDEs via the [Model Context Protocol](https://modelcontextprotocol.io/).

### Transport

`StdioServerTransport` — communicates over stdin/stdout, suitable for IDE integrations and subprocess invocation.

### Tools

| Tool | Input | Output |
|---|---|---|
| `repo_map` | `repoRoot?: string` | Contents of `AI_CONTEXT.md` + metadata |

### Planned Extensions

- `run_lint` — run ESLint and return results
- `run_typecheck` — run `tsc --noEmit` and return errors
- `search_files` — semantic file search within the repo

---

## 14. Utilities & Shared Logic

**Directory:** `lib/`

| File | Exports | Purpose |
|---|---|---|
| `auth.ts` | `authOptions` | NextAuth configuration |
| `db.ts` | `db` | Prisma client singleton |
| `session.ts` | `getCurrentUser()` | Server-side authenticated user fetch |
| `stripe.ts` | `stripe` | Stripe SDK client |
| `subscription.ts` | `getUserSubscriptionPlan()` | Subscription status check |
| `exceptions.ts` | `RequiresProPlanError` | Custom error for plan gates |
| `utils.ts` | `cn()`, `formatDate()`, `absoluteUrl()` | General-purpose helpers |
| `toc.ts` | `getTableOfContents()` | Parses raw markdown into TOC tree |
| `validations/post.ts` | `postPatchSchema` | Zod schema for post updates |
| `validations/auth.ts` | | Zod schemas for auth forms |
| `validations/user.ts` | `userNameSchema` | Zod schema for profile updates |
| `validations/og.ts` | | Zod schema for OG image params |

---

## 15. Tooling & Configuration

### TypeScript (`tsconfig.json`)

```json
{
  "target": "ES5",
  "module": "ESNext",
  "strict": false,
  "strictNullChecks": true,
  "paths": {
    "@/*": ["./*"],
    "#velite": ["./.velite"]
  },
  "plugins": [{ "name": "next" }]
}
```

### Next.js (`next.config.mjs`)

```js
import "./env.mjs"               // validate env vars at startup

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" }
    ]
  },
  webpack: (config) => {
    config.plugins.push(new (require("velite").VeliteWebpackPlugin)())
    return config
  },
}
```

### pnpm (`.npmrc`)

```ini
shamefully-hoist=true   # flat node_modules for Turbopack Windows compatibility
```

### ESLint (`.eslintrc.json`)

Extends: `next/core-web-vitals`, `prettier`, `plugin:tailwindcss/recommended`
Key rules: enforced Tailwind class ordering, no arbitrary custom classes.

### Prettier (`prettier.config.js`)

- Plugins: `@ianvs/prettier-plugin-sort-imports`, `prettier-plugin-tailwindcss`
- Import order: React → Next → third-party → `@/*` → relative
- Style: single quotes, no semicolons, 100-char line width

### Git Hooks (Husky)

- `pre-commit`: `pretty-quick --staged` (format staged files)
- `commit-msg`: `commitlint` (enforce Conventional Commits)

### npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Development with webpack |
| `dev:content` | `velite --watch` | Watch MDX content changes |
| `build` | `velite && next build` | Production build |
| `turbo` | `velite && next dev --turbo` | Development with Turbopack |
| `start` | `next start` | Serve production build |
| `preview` | `velite && next build && next start` | Full production preview |
| `lint` | `next lint` | ESLint |
| `check:types` | `tsc --noEmit` | Type-check only |
| `mcp:vwa` | `tsx mcp/vwa-mcp-server.ts` | Start MCP server |

---

## 16. Key Architectural Patterns

### Server Components by Default

All layouts and pages are React Server Components unless explicitly marked `"use client"`. Data fetching happens at the component level using `async/await` without useEffect or client-side loading states.

### Composition via Route Groups

Route groups (`(auth)`, `(dashboard)`, `(docs)`, `(editor)`, `(marketing)`) provide layout isolation and colocate related routes without affecting URL structure.

### Authentication Guards

Two-layer protection:
1. **Middleware** — redirects at the edge before any rendering
2. **Layout** — `getCurrentUser()` check in Server Component layout; returns 404/redirect if no session

### Subscription Gates

Resource creation APIs check both authentication and subscription plan. The `RequiresProPlanError` + `402` response pattern lets the client distinguish plan-limited failures from auth failures.

### Zod End-to-End

Zod schemas cover: API request bodies (`postPatchSchema`), environment variables (`env.mjs`), form validation (`react-hook-form` resolvers), and OG image parameters.

### Content Separation

MDX content (static, version-controlled) is entirely separate from user-generated content (dynamic, database-stored). Velite handles the former; Prisma handles the latter.

### Type-Safe CSS

Component variants are defined with `class-variance-authority`, eliminating string-based prop mapping. The `cn()` utility (clsx + tailwind-merge) ensures class deduplication and safe overrides.

---

## 17. Dependency Map

```
                        ┌─────────────────────────────────────┐
                        │           Next.js 14 (App Router)    │
                        └──────────────┬──────────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
   ┌──────▼──────┐             ┌───────▼───────┐            ┌──────▼──────┐
   │  Auth Layer  │             │  Data Layer   │            │  UI Layer   │
   │  NextAuth v4 │             │  Prisma ORM   │            │  Radix UI   │
   │  GitHub OAuth│             │  MySQL        │            │  shadcn/ui  │
   │  Email/OTP   │             │  Stripe       │            │  Tailwind   │
   │  Postmark    │             └───────────────┘            └─────────────┘
   └─────────────┘
          │                            │
   ┌──────▼──────┐             ┌───────▼───────┐
   │  Content     │             │  i18n Layer   │
   │  Velite      │             │  i18next      │
   │  MDX/remark  │             │  en / ht      │
   │  rehype      │             │  Middleware   │
   └─────────────┘             └───────────────┘
```

### Versioned Dependency Overview

| Package | Version | Category |
|---|---|---|
| next | ^14.2.32 | Core |
| react / react-dom | ^18.2.0 | Core |
| typescript | 5.4.3 | Core |
| @prisma/client | ^5.11.0 | Database |
| next-auth | 4.24.12 | Auth |
| velite | ^0.3.1 | Content |
| tailwindcss | ^3.4.1 | Styling |
| stripe | ^14.22.0 | Payments |
| zod | ^3.22.4 | Validation |
| i18next | ^23.10.1 | i18n |
| react-hook-form | ^7.51.1 | Forms |
| remark-gfm | ^4.0.0 | MDX |
| rehype-pretty-code | ^0.13.2 | MDX |
| shiki | ^1.2.0 | Syntax highlighting |
| @vercel/og | ^0.6.2 | OG images |
| @vercel/analytics | ^1.2.2 | Analytics |
| @editorjs/editorjs | ^2.29.1 | Editor |
| @modelcontextprotocol/sdk | ^1.25.3 | MCP |
| @t3-oss/env-nextjs | ^0.9.2 | Env validation |

---

*Generated: 2026-03-20*
