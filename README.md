# Next.js + Supabase Project

This is a Next.js application configured for Supabase integration. It demonstrates how to set up Supabase in a Next.js project without authentication.

## Getting Started

1. **Install dependencies**

```bash
npm install --legacy-peer-deps
# or
yarn install --ignore-engines
# or
pnpm install --no-strict-peer-dependencies
```

2. **Set up environment variables**

Copy the example environment file and update with your Supabase details:

```bash
cp .env.local.example .env.local
```

Then update the following values in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages
- `components/` - Reusable React components
- `lib/supabase/` - Supabase client setup

## Supabase Integration

This project includes:

- Client-side Supabase client (`lib/supabase/client.ts`)
- Server-side Supabase client (`lib/supabase/server.ts`)
- Type definitions for Supabase tables (`lib/supabase/types.ts`)
- Example API routes using Supabase (`app/api/examples/route.ts`)
- Client component example (`components/ExampleDataList.tsx`)

## Setting up Supabase

1. Create a project on [Supabase](https://supabase.com/)
2. Create tables in your Supabase database
3. Update the type definitions in `lib/supabase/types.ts` to match your tables
4. Update `.env.local` with your Supabase URL and anon key

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction) 