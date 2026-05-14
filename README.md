# Prepwise

Prepwise is a mobile-first SaaS-style EdTech frontend foundation for Nigerian exam preparation across JAMB, WAEC, and NECO.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS and shadcn/ui-style primitives
- Framer Motion-ready structure
- Zustand
- TanStack Query
- Supabase Auth and database
- React Hook Form and Zod
- Lucide React

## Architecture

```txt
src/
  app/              route groups, layouts, loading/error boundaries
  components/       reusable UI and layout primitives
  config/           site and navigation config
  constants/        starter product data and mocks
  features/         feature-owned product screens and workflows
  hooks/            shared React hooks
  lib/              utilities and validation schemas
  providers/        app providers for theme and data fetching
  services/         Supabase clients, auth, and API modules
  store/            modular Zustand state
  types/            product and database types
supabase/
  schema.sql        initial relational schema, enums, and RLS policies
```

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run `npm install`.
4. Run `npm run dev`.

The public landing page can render without Supabase credentials. Authenticated actions require Supabase environment variables.
