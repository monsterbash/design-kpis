# Design KPIs

A lightweight team dashboard for tracking individual and team design KPIs.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up seed data (local development)

```bash
cp seed-data.example.json seed-data.json
```

Edit `seed-data.json` with your team's users and metrics. See `seed-data.example.json` for the expected format and available field templates.

### 3. Initialize and seed the database

```bash
npx drizzle-kit generate
npx tsx src/lib/seed.ts
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production (Turso)

For production, the app uses [Turso](https://turso.tech) as a hosted SQLite database.

Set the following environment variables:

```
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

Push the schema to the remote database:

```bash
npm run db:push
```

No seed script is needed in production — create accounts and metrics through the app UI.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** SQLite (local) / Turso (production) via Drizzle ORM
- **Auth:** NextAuth.js v5
- **Font:** Inclusive Sans
