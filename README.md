# Vwa

An open source application built to inform and mobilize Haitians.

## About this project

This project as an experiment to see how we can mobilize Haitains to engage in civics. The starting point of the app was forked form an OSS Next.js project called Taxonmy. The base fork provided features like authentication, subscriptions, API routes, static pages for docs ...etc.

## Note on Performance

> **Warning**
> This app is forked from a base that uses the unstable releases for Next.js 13 and React 18. These features are now available in Next.js 14 and we should at some point consider doing a migration.
> **Expect some performance hits when testing the dashboard (The dashboard part of the app is not yet being used.)**.

## Features

- New `/app` dir,
- Routing, Layouts, Nested Layouts and Layout Groups
- Data Fetching, Caching and Mutation
- Loading UI
- Route handlers
- Metadata files
- Server and Client Components
- API Routes and Middlewares
- Authentication using **NextAuth.js**
- ORM using **Prisma**
- Database on **PlanetScale**
- UI Components built using **Radix UI**
- Documentation and blog using **MDX** and **Contentlayer**
- Subscriptions using **Stripe**
- Styled using **Tailwind CSS**
- Validations using **Zod**
- Written in **TypeScript**

## Roadmap

- Planned Features
- []
- Preloaded Features
  - [x] ~Add MDX support for basic pages~
  - [x] ~Build marketing pages~
  - [x] ~Subscriptions using Stripe~
  - [x] ~Responsive styles~
  - [x] ~Add OG image for blog using @vercel/og~
  - [x] Dark mode

## Known Issues

A list of things not working right now:

1. ~GitHub authentication (use email)~
2. ~[Prisma: Error: ENOENT: no such file or directory, open '/var/task/.next/server/chunks/schema.prisma'](https://github.com/prisma/prisma/issues/16117)~
3. ~[Next.js 13: Client side navigation does not update head](https://github.com/vercel/next.js/issues/42414)~
4. [Cannot use opengraph-image.tsx inside catch-all routes](https://github.com/vercel/next.js/issues/48162)

## Running Locally

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Copy `.env.example` to `.env.local` and update the variables.

```sh
cp .env.example .env.local
```

3. Start the development server:

```sh
pnpm dev
```

## Contributors

- []()

## License

Licensed under the [MIT license](https://github.com/shadcn/taxonomy/blob/main/LICENSE.md).
