/**
 * Turn raw Google-style category labels into short, natural phrases for prose
 * (e.g. city page intros). Omits entries that do not look plastic-surgery-related.
 */

const EXACT_PHRASE: Record<string, string> = {
  "plastic surgeon": "plastic surgeons",
  "cosmetic surgeon": "cosmetic surgeons",
  "plastic surgery clinic": "plastic surgery clinics",
  "cosmetic surgery clinic": "cosmetic surgery clinics",
  "medical spa": "medical spas",
  "plastic surgery center": "plastic surgery centers",
  "cosmetic surgery center": "cosmetic surgery centers",
  "facial plastic surgeon": "facial plastic surgeons",
  "reconstructive surgeon": "reconstructive surgeons",
  "board certified plastic surgeon": "board-certified plastic surgeons",
  "aesthetic surgeon": "aesthetic surgeons",
  "aesthetic clinic": "aesthetic clinics",
};

const PLASTIC_SURGERY_LIKE =
  /plastic\s*surgery|cosmetic\s*surgery|plastic\s*surgeon|cosmetic\s*surgeon|medical\s*spa|aesthetic|reconstruct|rhinoplasty|blepharoplasty|liposuction|facelift|botox|injectable|body\s*contour|breast\s*(augment|reduction|lift)|otolaryngologist|oral\s*and\s*maxillofacial/i;

/** Labels that match common noise but are not relevant services. */
const NON_PLASTIC_SURGERY =
  /auto\s+repair|collision|transmission|student\s+dormitory|orthodox\s+church|storage\s+facility|insurance\s+agency/i;

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Fallback: lowercase prose, light plural / phrasing for service-style labels. */
function humanizeFallback(raw: string): string {
  let s = raw.trim().toLowerCase();
  if (!s) return "";
  if (s.endsWith(" service")) {
    return `${s.slice(0, -" service".length)} services`;
  }
  if (s.endsWith(" clinic")) {
    return s.replace(/ clinic$/, " clinics");
  }
  if (s.endsWith(" center")) {
    return s.replace(/ center$/, " centers");
  }
  if (s.endsWith("ist") && !s.endsWith("plastic surgeon")) {
    return `${s}s`;
  }
  if (!s.endsWith("s")) {
    return `${s}s`;
  }
  return s;
}

function phraseForLabel(raw: string): string | null {
  const key = normalizeKey(raw);
  if (!key) return null;
  if (NON_PLASTIC_SURGERY.test(key)) return null;
  if (EXACT_PHRASE[key]) return EXACT_PHRASE[key];
  if (!PLASTIC_SURGERY_LIKE.test(raw)) return null;
  return humanizeFallback(raw);
}

function oxfordJoin(items: string[]): string {
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * @param careTypes Raw labels from listings (dedupe before calling if needed).
 * @param maxItems Cap how many categories appear in the sentence (default 5).
 * @returns Clause starting with "including …" or a neutral fallback (no leading "including" duplicate in caller).
 */
export function formatCareTypesClause(
  careTypes: string[],
  maxItems = 5,
): string {
  const seen = new Set<string>();
  const phrases: string[] = [];
  for (const raw of careTypes) {
    const p = phraseForLabel(raw);
    if (!p || seen.has(p)) continue;
    seen.add(p);
    phrases.push(p);
    if (phrases.length >= maxItems) break;
  }
  if (phrases.length === 0) {
    return "including cosmetic and reconstructive surgery services";
  }
  return `including ${oxfordJoin(phrases)}`;
}
