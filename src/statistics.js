import { localDateString } from "./dateUtils.js";

export const DISCIPLINE_ORDER = ["Trad", "Sport", "Boulder", "Ice", "Other"];

// A mixed route type like "Trad, Sport" takes its first-listed discipline as primary.
export function classifyDiscipline(routeType) {
  if (!routeType) return "Other";
  const first = routeType.split(",")[0].trim();
  return DISCIPLINE_ORDER.includes(first) ? first : "Other";
}

const MID_GRADE_NUMS = [10, 11, 12, 13];

export const GRADE_BUCKETS = [
  "<=5.6", "5.7", "5.8", "5.9",
  ...MID_GRADE_NUMS.flatMap((n) => [`5.${n}-`, `5.${n}`, `5.${n}+`]),
  ">=5.14",
];

export function gradeBucket(rating) {
  if (!rating) return null;
  const token = rating.trim().split(/\s+/)[0];
  const m = token.match(/^5\.(\d+)([+-]|[a-d](\/[a-d])?)?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (n <= 6) return "<=5.6";
  if (n <= 9) return `5.${n}`;
  if (n >= 14) return ">=5.14";
  const suffix = (m[2] || "").toLowerCase();
  if (suffix === "a" || suffix === "-" || suffix === "a/b") return `5.${n}-`;
  if (suffix === "c" || suffix === "+" || suffix === "c/d" || suffix === "d") return `5.${n}+`;
  return `5.${n}`;
}

export const BOULDER_BUCKETS = [...Array.from({ length: 14 }, (_, i) => `V${i}`), ">=V14"];

export function boulderBucket(rating) {
  if (!rating) return null;
  const m = rating.trim().match(/^v\s*(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 14 ? ">=V14" : `V${n}`;
}

function cutoff(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return localDateString(d);
}

export const PERIODS = [
  { label: "90 Days", days: 90 },
  { label: "Last Year", days: 365 },
  { label: "5 Years", days: 365 * 5 },
  { label: "All Time", days: null },
];

export function periodStats(ticks, days) {
  const from = days == null ? null : cutoff(days);
  const inPeriod = from == null ? ticks : ticks.filter((t) => t.date >= from);
  const pitches = inPeriod.reduce((sum, t) => sum + (Number(t.pitches) || 0), 0);
  const routes = inPeriod.length;
  const daysOut = new Set(inPeriod.map((t) => t.date).filter(Boolean)).size;
  return { pitches, routes, daysOut };
}

function emptyTotals() {
  return Object.fromEntries(DISCIPLINE_ORDER.map((d) => [d, 0]));
}

export function pitchesByYear(ticks) {
  const years = ticks.map((t) => t.date?.slice(0, 4)).filter(Boolean);
  if (years.length === 0) return [];
  const minYear = Math.min(...years.map(Number));
  const maxYear = Math.max(...years.map(Number));
  const byYear = new Map();
  for (let y = minYear; y <= maxYear; y++) byYear.set(String(y), emptyTotals());
  for (const t of ticks) {
    const year = t.date?.slice(0, 4);
    if (!year || !byYear.has(year)) continue;
    byYear.get(year)[classifyDiscipline(t.routeType)] += Number(t.pitches) || 0;
  }
  return [...byYear.entries()].map(([label, totals]) => ({ label, totals }));
}

export function pitchesByMonth(ticks, monthsBack = 60) {
  const now = new Date();
  const months = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const byMonth = new Map(months.map((m) => [m, emptyTotals()]));
  for (const t of ticks) {
    const month = t.date?.slice(0, 7);
    if (!month || !byMonth.has(month)) continue;
    byMonth.get(month)[classifyDiscipline(t.routeType)] += Number(t.pitches) || 0;
  }
  return months.map((label) => ({ label, totals: byMonth.get(label) }));
}

export function routesByGrade(ticks) {
  const byBucket = new Map(GRADE_BUCKETS.map((b) => [b, emptyTotals()]));
  for (const t of ticks) {
    const discipline = classifyDiscipline(t.routeType);
    if (discipline === "Boulder") continue;
    const bucket = gradeBucket(t.rating);
    if (!bucket) continue;
    byBucket.get(bucket)[discipline] += 1;
  }
  return GRADE_BUCKETS.map((label) => ({ label, totals: byBucket.get(label) }));
}

export function bouldersByGrade(ticks) {
  const byBucket = new Map(BOULDER_BUCKETS.map((b) => [b, 0]));
  for (const t of ticks) {
    if (classifyDiscipline(t.routeType) !== "Boulder") continue;
    const bucket = boulderBucket(t.rating);
    if (!bucket) continue;
    byBucket.set(bucket, byBucket.get(bucket) + 1);
  }
  return BOULDER_BUCKETS.map((label) => ({ label, totals: { Boulder: byBucket.get(label) } }));
}
