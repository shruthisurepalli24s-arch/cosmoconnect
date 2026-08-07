/**
 * Fetch real cosmetology jobs from Adzuna for Cosmo Connect markets.
 *
 * Requires free credentials from https://developer.adzuna.com/signup
 * Set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env.local (or the environment).
 *
 * Usage: node --env-file=.env.local scripts/fetch-jobs.mjs
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

if (!APP_ID || !APP_KEY) {
  console.error(
    "Missing ADZUNA_APP_ID / ADZUNA_APP_KEY.\n" +
      "1) Sign up free: https://developer.adzuna.com/signup\n" +
      "2) Create .env.local with those values\n" +
      "3) Re-run: npm run fetch:jobs",
  );
  process.exit(1);
}

const MARKETS = [
  { where: "Los Angeles, CA", city: "Los Angeles", state: "CA" },
  { where: "San Francisco, CA", city: "San Francisco", state: "CA" },
  { where: "San Diego, CA", city: "San Diego", state: "CA" },
  { where: "Sacramento, CA", city: "Sacramento", state: "CA" },
  { where: "Las Vegas, NV", city: "Las Vegas", state: "NV" },
];

const QUERIES = [
  "hair stylist",
  "hairstylist",
  "colorist",
  "cosmetologist",
  "nail technician",
  "manicurist",
  "barber",
  "esthetician",
  "makeup artist",
  "lash technician",
  "balayage stylist",
  "beautician",
];

/** Title must look like a hands-on cosmetology / salon chair role */
const ROLE_TITLE_RE =
  /\b(hair\s*stylist|hairstylist|hair\s*dresser|hairdresser|stylist|colorist|cosmetologist|cosmetology|nail\s*tech(?:nician)?|manicurist|pedicurist|barber|barbering|esthetician|esthetician|makeup\s*artist|make[\s-]?up\s*artist|lash\s*tech(?:nician)?|lash\s*artist|brow\s*artist|beautician|blow\s*dry(?:er)?|dry\s*bar\s*stylist|shampoo\s*(?:assistant|tech)|salon\s*assistant|stylist\s*assistant|assistant\s*stylist|apprentice(?:\s*stylist)?|licensed\s*cosmetolog\w*|braider|extensionist|color\s*bar\s*assistant|keratin\s*tech)\b/i;

/** Corporate / non-chair roles to drop even if the company is a beauty brand */
const EXCLUDE_TITLE_RE =
  /\b(project\s*manager|product\s*manager|program\s*manager|brand\s*manager|marketing|influencer|director of social|content\s*manager|social\s*media|receptionist|housekeeper|operations\s*manager|guest\s*service|consultant|massage|spa\s*attendant|spa\s*receptionist|sales\s*(and|&)\s*artistry|coordinator|accountant|engineer|developer|software|nurse|driver|warehouse)\b/i;

const SKILL_PATTERNS = [
  { skill: "Balayage", patterns: [/\bbalayage\b/i, /\bfoilayage\b/i] },
  { skill: "Keratin treatment", patterns: [/\bkeratin\b/i, /\bbrazilian blow\b/i] },
  {
    skill: "Hair extensions",
    patterns: [
      /\bhair extensions?\b/i,
      /\bhand[-\s]?tied extensions?\b/i,
      /\btape[-\s]?in extensions?\b/i,
    ],
  },
  {
    skill: "Bridal makeup",
    patterns: [/\bbridal makeup\b/i, /\bwedding makeup\b/i],
  },
  {
    skill: "Bridal styling",
    patterns: [/\bbridal (hair|styl)/i, /\bwedding (hair|styl)/i],
  },
  {
    skill: "Makeup",
    patterns: [
      /\bmakeup artist\b/i,
      /\bmake[\s-]?up artist\b/i,
      /\bpermanent makeup\b/i,
    ],
  },
  {
    skill: "Nail art",
    patterns: [
      /\bnail art\b/i,
      /\bgel nail/i,
      /\bmanicur/i,
      /\bnail tech/i,
      /\bpedicur/i,
    ],
  },
  {
    skill: "Color correction",
    patterns: [/\bcolor correction\b/i, /\bcolour correction\b/i],
  },
  {
    skill: "Lash & brow",
    patterns: [
      /\blash(es)?\b/i,
      /\bbrow(s)?\b/i,
      /\bmicroblading\b/i,
      /\blash tech/i,
      /\bbrow artist\b/i,
    ],
  },
  {
    skill: "Esthetics",
    patterns: [
      /\besthetician\b/i,
      /\baesthetician\b/i,
      /\besthetics?\b/i,
      /\bfacials?\b/i,
      /\bwaxing\b/i,
      /\bskincare\b/i,
      /\bskin care\b/i,
    ],
  },
  {
    skill: "Barbering fades",
    patterns: [/\bfade(s)?\b/i, /\bbarber\b/i, /\btaper\b/i],
  },
  {
    skill: "Highlights",
    patterns: [/\bhighlights?\b/i, /\blowlights?\b/i, /\bfoils?\b/i],
  },
  {
    skill: "Blowouts",
    patterns: [/\bblow ?outs?\b/i, /\bblowdry\b/i, /\bblow dry\b/i],
  },
  {
    skill: "Cut & style",
    patterns: [
      /\bcut(ting)? and styl/i,
      /\bhaircut\b/i,
      /\bhair stylist\b/i,
      /\bhairstylist\b/i,
      /\bcosmetolog/i,
    ],
  },
];

const CITY_MATCHERS = [
  {
    city: "Los Angeles",
    state: "CA",
    tests: [
      /\blos angeles\b/i,
      /\bhollywood\b/i,
      /\bsanta monica\b/i,
      /\bpasadena\b/i,
      /\bglendale\b/i,
      /\bburbank\b/i,
      /\blong beach\b/i,
      /\bculver city\b/i,
      /\bpalms\b/i,
      /\bbaldwin hills\b/i,
      /\bfoy\b/i,
      /\bhollywood county\b/i,
      /\bwest hollywood\b/i,
      /\bbingwood\b/i,
      /\bsherman oaks\b/i,
      /\bstudio city\b/i,
      /\bvenice\b/i,
      /\bmarina del rey\b/i,
    ],
  },
  {
    city: "San Francisco",
    state: "CA",
    tests: [
      /\bsan francisco\b/i,
      /\boakland\b/i,
      /\bberkeley\b/i,
      /\bsan jose\b/i,
      /\bpalo alto\b/i,
      /\bdaly city\b/i,
      /\balameda\b/i,
      /\bsan mateo\b/i,
      /\bsouth san francisco\b/i,
    ],
  },
  {
    city: "San Diego",
    state: "CA",
    tests: [
      /\bsan diego\b/i,
      /\bchula vista\b/i,
      /\bla jolla\b/i,
      /\bcarlsbad\b/i,
      /\bocanside\b/i,
    ],
  },
  {
    city: "Sacramento",
    state: "CA",
    tests: [
      /\bsacramento\b/i,
      /\broseville\b/i,
      /\belk grove\b/i,
      /\bfolsom\b/i,
      /\barden\b/i,
    ],
  },
  {
    city: "Las Vegas",
    state: "NV",
    tests: [
      /\blas vegas\b/i,
      /\bhenderson\b/i,
      /\bparadise\b/i,
      /\bsummerlin\b/i,
      /\bnorth las vegas\b/i,
    ],
  },
];

function extractSkills(text) {
  const found = [];
  for (const { skill, patterns } of SKILL_PATTERNS) {
    if (patterns.some((p) => p.test(text))) found.push(skill);
  }
  return found;
}

function matchCity(locationText) {
  for (const entry of CITY_MATCHERS) {
    if (entry.tests.some((t) => t.test(locationText))) {
      return { city: entry.city, state: entry.state };
    }
  }
  return null;
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSource(redirectUrl) {
  try {
    const host = new URL(redirectUrl).hostname.replace(/^www\./, "");
    if (host.includes("indeed")) return "Indeed";
    if (host.includes("craigslist")) return "Craigslist";
    if (host.includes("ziprecruiter")) return "ZipRecruiter";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("glassdoor")) return "Glassdoor";
  } catch {
    /* ignore */
  }
  return "Adzuna";
}

function isCosmetologyRole(title) {
  if (EXCLUDE_TITLE_RE.test(title)) return false;
  return ROLE_TITLE_RE.test(title);
}

function adzunaToJob(raw, market) {
  const locationText = [
    raw.location?.display_name ?? "",
    ...(raw.location?.area ?? []),
  ].join(" ");
  const matched = matchCity(locationText) ?? {
    city: market.city,
    state: market.state,
  };
  if (!raw.redirect_url) return null;

  const description = stripHtml(raw.description ?? "");
  const title = stripHtml(raw.title);
  if (!isCosmetologyRole(title)) return null;

  const salon = raw.company?.display_name?.trim() || "Salon / studio";
  const text = `${title} ${description}`;

  let pay = "Pay not listed";
  if (raw.salary_min && raw.salary_max) {
    pay = `$${Math.round(raw.salary_min).toLocaleString()}–$${Math.round(raw.salary_max).toLocaleString()}/yr`;
  } else if (raw.salary_min) {
    pay = `From $${Math.round(raw.salary_min).toLocaleString()}/yr`;
  }

  const parts = [raw.contract_time, raw.contract_type].filter(Boolean);
  const employmentType = parts.length
    ? parts
        .map((p) =>
          String(p)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        )
        .join(" · ")
    : "Not specified";

  return {
    id: `adz-${raw.id}`,
    title,
    salon,
    role: title.split(/[-–|]/)[0]?.trim() || "Stylist",
    city: matched.city,
    state: matched.state,
    source: detectSource(raw.redirect_url),
    skills: extractSkills(text),
    employmentType,
    pay,
    postedAt: (raw.created ?? new Date().toISOString()).slice(0, 10),
    description:
      description ||
      `${salon} is hiring in ${matched.city}. Apply via the original posting.`,
    applyUrl: raw.redirect_url,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchAdzuna(what, where, page = 1) {
  const url = new URL(
    `https://api.adzuna.com/v1/api/jobs/us/search/${page}`,
  );
  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("what", what);
  url.searchParams.set("where", where);
  url.searchParams.set("max_days_old", "90");
  url.searchParams.set("distance", "40");
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Adzuna ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

const byId = new Map();
let requests = 0;

for (const market of MARKETS) {
  for (const query of QUERIES) {
    process.stdout.write(`Fetching "${query}" in ${market.where}...\n`);
    const data = await searchAdzuna(query, market.where, 1);
    requests += 1;
    for (const raw of data.results ?? []) {
      const job = adzunaToJob(raw, market);
      if (job) byId.set(job.id, job);
    }
    await sleep(450);
  }
}

const jobs = [...byId.values()].sort((a, b) =>
  a.postedAt < b.postedAt ? 1 : -1,
);

const outPath = join(root, "src", "data", "jobs.json");
const metaPath = join(root, "src", "data", "jobs-meta.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(jobs, null, 2));
writeFileSync(
  metaPath,
  JSON.stringify(
    {
      source: "Adzuna",
      fetchedAt: new Date().toISOString(),
      count: jobs.length,
      requests,
      markets: MARKETS.map((m) => m.where),
      queries: QUERIES,
    },
    null,
    2,
  ),
);

console.log(`\nWrote ${jobs.length} real jobs (${requests} API calls) → ${outPath}`);
if (jobs.length) {
  console.log("Sample apply URL:", jobs[0].applyUrl);
}
