import { CITIES } from "@/lib/constants";
import { extractSkills } from "@/lib/skills";
import type { Job } from "@/lib/types";

export type AdzunaJob = {
  id: string;
  title: string;
  description?: string;
  created?: string;
  redirect_url: string;
  contract_time?: string;
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
  company?: { display_name?: string };
  location?: {
    display_name?: string;
    area?: string[];
  };
};

const CITY_MATCHERS: { city: (typeof CITIES)[number]; state: string; tests: RegExp[] }[] =
  [
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
      ],
    },
    {
      city: "San Diego",
      state: "CA",
      tests: [/\bsan diego\b/i, /\bchula vista\b/i, /\bla jolla\b/i],
    },
    {
      city: "Sacramento",
      state: "CA",
      tests: [/\bsacramento\b/i, /\broseville\b/i, /\belk grove\b/i],
    },
    {
      city: "Las Vegas",
      state: "NV",
      tests: [/\blas vegas\b/i, /\bhenderson\b/i, /\bparadise\b/i, /\bsummerlin\b/i],
    },
  ];

export function matchCity(locationText: string): {
  city: (typeof CITIES)[number];
  state: string;
} | null {
  for (const entry of CITY_MATCHERS) {
    if (entry.tests.some((test) => test.test(locationText))) {
      return { city: entry.city, state: entry.state };
    }
  }
  return null;
}

function formatPay(job: AdzunaJob): string {
  if (job.salary_min && job.salary_max) {
    return `$${Math.round(job.salary_min).toLocaleString()}–$${Math.round(job.salary_max).toLocaleString()}/yr`;
  }
  if (job.salary_min) {
    return `From $${Math.round(job.salary_min).toLocaleString()}/yr`;
  }
  return "Pay not listed";
}

function employmentType(job: AdzunaJob): string {
  const parts = [job.contract_time, job.contract_type].filter(Boolean);
  if (!parts.length) return "Not specified";
  return parts
    .map((part) =>
      String(part)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(" · ");
}

function detectSource(redirectUrl: string): string {
  try {
    const host = new URL(redirectUrl).hostname.replace(/^www\./, "");
    if (host.includes("indeed")) return "Indeed";
    if (host.includes("craigslist")) return "Craigslist";
    if (host.includes("ziprecruiter")) return "ZipRecruiter";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("glassdoor")) return "Glassdoor";
    if (host.includes("adzuna")) return "Adzuna";
  } catch {
    /* ignore */
  }
  return "Adzuna";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function adzunaToJob(raw: AdzunaJob): Job | null {
  const locationText = [
    raw.location?.display_name ?? "",
    ...(raw.location?.area ?? []),
  ].join(" ");
  const matched = matchCity(locationText);
  if (!matched) return null;

  const description = stripHtml(raw.description ?? "");
  const text = `${raw.title} ${description}`;
  const salon = raw.company?.display_name?.trim() || "Salon / studio";
  const applyUrl = raw.redirect_url;
  if (!applyUrl) return null;

  return {
    id: `adz-${raw.id}`,
    title: stripHtml(raw.title),
    salon,
    role: stripHtml(raw.title).split(/[-–|]/)[0]?.trim() || "Stylist",
    city: matched.city,
    state: matched.state,
    source: detectSource(applyUrl),
    skills: extractSkills(text),
    employmentType: employmentType(raw),
    pay: formatPay(raw),
    postedAt: (raw.created ?? new Date().toISOString()).slice(0, 10),
    description:
      description ||
      `${salon} is hiring in ${matched.city}. Apply via the original posting.`,
    applyUrl,
  };
}
