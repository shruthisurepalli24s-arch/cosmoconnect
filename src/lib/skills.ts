/**
 * Skills are keyword-matched from job title + description.
 * A skill is attached only when its own phrases appear — never by role alias
 * (e.g. "esthetician" must NOT imply "Lash & brow").
 */
export const SKILL_PATTERNS: { skill: string; patterns: RegExp[] }[] = [
  {
    skill: "Balayage",
    patterns: [/\bbalayage\b/i, /\bfoilayage\b/i],
  },
  {
    skill: "Keratin treatment",
    patterns: [/\bkeratin\b/i, /\bbrazilian blow\b/i],
  },
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

export function extractSkills(text: string): string[] {
  const found: string[] = [];
  for (const { skill, patterns } of SKILL_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) {
      found.push(skill);
    }
  }
  return found;
}
