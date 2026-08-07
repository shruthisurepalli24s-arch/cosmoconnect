import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNT = 420;

const cities = [
  { name: "Los Angeles", state: "CA", weight: 34 },
  { name: "San Francisco", state: "CA", weight: 18 },
  { name: "San Diego", state: "CA", weight: 16 },
  { name: "Sacramento", state: "CA", weight: 12 },
  { name: "Las Vegas", state: "NV", weight: 20 },
];

const sources = [
  { name: "Instagram", weight: 28 },
  { name: "Facebook Groups", weight: 24 },
  { name: "Indeed", weight: 14 },
  { name: "Craigslist", weight: 10 },
  { name: "Independent salon websites", weight: 8 },
  { name: "Local salons", weight: 7 },
  { name: "Academy bulletin boards", weight: 5 },
  { name: "Reddit", weight: 4 },
];

const skills = [
  { name: "Balayage", weight: 120 },
  { name: "Keratin treatment", weight: 80 },
  { name: "Hair extensions", weight: 65 },
  { name: "Bridal makeup", weight: 40 },
  { name: "Nail art", weight: 20 },
  { name: "Color correction", weight: 55 },
  { name: "Lash & brow", weight: 48 },
  { name: "Barbering fades", weight: 42 },
  { name: "Bridal styling", weight: 38 },
  { name: "Blowouts", weight: 35 },
  { name: "Highlights", weight: 50 },
  { name: "Cut & style", weight: 70 },
];

const roles = [
  "Stylist",
  "Senior Stylist",
  "Colorist",
  "Assistant Stylist",
  "Booth Renter",
  "Nail Technician",
  "Makeup Artist",
  "Barber",
  "Lash Artist",
  "Front Desk / Stylist Hybrid",
];

const salonPrefixes = [
  "Atelier",
  "Studio",
  "Maison",
  "House of",
  "The",
  "Salon",
  "Collective",
  "Room",
];

const salonNames = [
  "Noir",
  "Luma",
  "Velvet Shear",
  "Golden Comb",
  "Bloom",
  "Cascade",
  "Mirror",
  "Aether",
  "Silk & Stone",
  "Rivet",
  "Citrine",
  "Halo",
  "Ember",
  "Northlight",
  "Palm & Pin",
  "Copper Root",
  "Ivory Chair",
  "Night Orchid",
  "Solstice",
  "Fable",
];

const employmentTypes = ["Full-time", "Part-time", "Booth rental", "Commission"];

function weightedPick(items, rng) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function uniqueSkills(rng, count) {
  const chosen = new Set();
  while (chosen.size < count) {
    chosen.add(weightedPick(skills, rng).name);
  }
  return [...chosen];
}

function salaryFor(role, city, rng) {
  const base = {
    "Assistant Stylist": [18, 24],
    Stylist: [22, 38],
    "Senior Stylist": [30, 55],
    Colorist: [28, 52],
    "Booth Renter": [0, 0],
    "Nail Technician": [18, 32],
    "Makeup Artist": [20, 45],
    Barber: [20, 40],
    "Lash Artist": [18, 35],
    "Front Desk / Stylist Hybrid": [17, 26],
  }[role] || [20, 35];

  if (role === "Booth Renter") {
    const chair = 150 + Math.floor(rng() * 250);
    return `Booth $${chair}/wk`;
  }

  const cityBump =
    city === "San Francisco" || city === "Los Angeles"
      ? 4
      : city === "Las Vegas"
        ? 1
        : 0;
  const low = base[0] + cityBump + Math.floor(rng() * 3);
  const high = base[1] + cityBump + Math.floor(rng() * 6);
  return `$${low}–$${high}/hr`;
}

function daysAgo(rng, max = 28) {
  return Math.floor(rng() * max);
}

function craigslistHost(city) {
  const map = {
    "Los Angeles": "losangeles",
    "San Francisco": "sfbay",
    "San Diego": "sandiego",
    Sacramento: "sacramento",
    "Las Vegas": "lasvegas",
  };
  return map[city] ?? "losangeles";
}

function buildApplyUrl(source, city, state, title, salon) {
  const query = encodeURIComponent(`${title} ${salon}`);
  const location = encodeURIComponent(`${city}, ${state}`);
  const salonQuery = encodeURIComponent(`${salon} ${city} hiring`);

  switch (source) {
    case "Indeed":
      return `https://www.indeed.com/jobs?q=${query}&l=${location}`;
    case "Craigslist":
      return `https://${craigslistHost(city)}.craigslist.org/search/jjj?query=${encodeURIComponent(`${roleSafe(title)} salon`)}`;
    case "Facebook Groups":
      return `https://www.facebook.com/search/posts/?q=${query}`;
    case "Instagram":
      return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(`${salon} hiring`)}`;
    case "Reddit":
      return `https://www.reddit.com/search/?q=${query}&type=link`;
    case "Independent salon websites":
    case "Local salons":
      return `https://www.google.com/search?q=${salonQuery}`;
    case "Academy bulletin boards":
      return `https://www.google.com/search?q=${encodeURIComponent(`${city} cosmetology academy ${title}`)}`;
    default:
      return `https://www.google.com/search?q=${query}+${location}`;
  }
}

function roleSafe(title) {
  return title.split("—")[0].trim();
}

const rng = mulberry32(20260806);
const jobs = [];

for (let i = 0; i < COUNT; i++) {
  const city = weightedPick(cities, rng);
  const source = weightedPick(sources, rng);
  const role = pick(roles, rng);
  const skillList = uniqueSkills(rng, 1 + Math.floor(rng() * 3));
  const salon = `${pick(salonPrefixes, rng)} ${pick(salonNames, rng)}`.replace(
    /^The The /,
    "The ",
  );
  const postedDaysAgo = daysAgo(rng);
  const postedAt = new Date(Date.UTC(2026, 7, 6));
  postedAt.setUTCDate(postedAt.getUTCDate() - postedDaysAgo);

  const titleSkill = skillList[0];
  const title =
    rng() > 0.45
      ? `${role} — ${titleSkill}`
      : `${role} at ${salon.replace(/^(Atelier|Studio|Maison|Salon|Collective|Room|House of|The) /, "")}`;

  const id = `job-${String(i + 1).padStart(3, "0")}`;
  jobs.push({
    id,
    title,
    salon,
    role,
    city: city.name,
    state: city.state,
    source: source.name,
    skills: skillList,
    employmentType: pick(employmentTypes, rng),
    pay: salaryFor(role, city.name, rng),
    postedAt: postedAt.toISOString().slice(0, 10),
    applyUrl: buildApplyUrl(source.name, city.name, city.state, title, salon),
    description: `${salon} in ${city.name} is hiring a ${role.toLowerCase()}. Looking for strong experience in ${skillList.join(", ").toLowerCase()}. ${
      source.name === "Instagram" || source.name === "Facebook Groups"
        ? "Originally shared in a local stylist community."
        : `Aggregated from ${source.name}.`
    } Busy clientele, supportive team, and room to grow into demand-led specializations.`,
  });
}

jobs.sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));

const outPath = join(__dirname, "..", "src", "data", "jobs.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(jobs, null, 2));
console.log(`Wrote ${jobs.length} jobs to ${outPath}`);
