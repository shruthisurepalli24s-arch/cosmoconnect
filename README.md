# Cosmo Connect

Cosmetology job portal with skill-demand insights for LA, SF, San Diego, Sacramento, and Vegas.

## Phase 1

- Searchable board of salon / beauty jobs
- Filters by city, skill, and source
- Insights from hiring posts (top skills, cities, sources)
- Apply links out to the **original** posting

Product plan: [`docs/PLAN.md`](docs/PLAN.md)

## Real job data (Adzuna)

Listings are pulled from [Adzuna](https://developer.adzuna.com/) (aggregates Indeed and other boards). Apply buttons use each ad’s real `redirect_url`.

1. Sign up free: https://developer.adzuna.com/signup  
2. Copy App ID + App Key into `.env.local`:

```bash
cp .env.example .env.local
# edit .env.local
```

3. Fetch jobs:

```bash
npm run fetch:jobs
```

4. Run locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js · TypeScript · Tailwind CSS · Adzuna Jobs API
