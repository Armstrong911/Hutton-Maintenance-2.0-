# Hutton Strata Maintenance Tracker

Next.js 15 · TypeScript · Prisma · PostgreSQL · NextAuth.js · Tailwind CSS

## Local Setup

```bash
npm install
cp .env.example .env.local
# Fill in your values in .env.local
npx prisma db push
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Seed Super Admin

After `npx prisma db push`, run this once to create your first admin:

```bash
node -e "
const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('hutton2024', 12);
  await prisma.user.create({
    data: { email: 'admin@huttonstrata.com', name: 'Hutton Admin', passwordHash: hash, isSuperAdmin: true }
  });
  console.log('Admin created: admin@huttonstrata.com / hutton2024');
}
main().finally(() => prisma.\$disconnect());
"
```

## Railway Deployment

1. Push code to GitHub
2. New Railway project → Deploy from GitHub repo
3. Add PostgreSQL service in Railway (same project)
4. Set environment variables in Railway → Variables:
   - `DATABASE_URL` → copy from Railway PostgreSQL service
   - `NEXTAUTH_SECRET` → run `openssl rand -base64 32`
   - `NEXTAUTH_URL` → your Railway domain (e.g. `https://strata-app.up.railway.app`)
5. Railway auto-deploys on every GitHub push

## Roles

| Role | Scope | Can Do |
|------|-------|--------|
| Super Admin | All buildings | Full access, manage all users & buildings |
| Administration | Per building | Full access for that building |
| Council | Per building | View records, approve |
| Owner | Per building | Read-only |

## Tech Stack

- **Next.js 15** App Router + TypeScript
- **Prisma** ORM → PostgreSQL (Railway)
- **NextAuth.js v5** credentials auth with JWT sessions
- **Tailwind CSS** for styling (PT Serif via next/font/google)
- **bcryptjs** for password hashing
