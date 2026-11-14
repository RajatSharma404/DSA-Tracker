#!/usr/bin/env node
/**
 * npm run roadmaps:fetch
 *
 * Builds backend/data/roadmaps.json from the original, public sources of
 * well-known LeetCode roadmaps. Re-run to refresh. Nothing is typed by hand
 * except short descriptions; problem lists come from:
 *   - NeetCode           github.com/neetcode-gh/leetcode (.problemSiteData.json)
 *   - LeetCode Patterns  github.com/seanprashad/leetcode-patterns
 *   - Grind 75 / 169     techinterviewhandbook.org (captured in scripts/roadmap-sources)
 *   - LeetCode official  leetcode.com study plans + Explore cards (public GraphQL)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = path.join(root, "scripts", "roadmap-sources");
const OUT = path.join(root, "backend", "data", "roadmaps.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const D = (d) => {
  const v = String(d || "").trim().toUpperCase();
  return v.startsWith("E") ? "EASY" : v.startsWith("H") ? "HARD" : "MEDIUM";
};
const titleCase = (s) =>
  s
    .split(/[-\s]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const getJson = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
};

const gql = async (query, variables, attempt = 0) => {
  const res = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers: { "content-type": "application/json", referer: "https://leetcode.com/", "user-agent": UA },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429 && attempt < 4) {
    await sleep(2000 * (attempt + 1));
    return gql(query, variables, attempt + 1);
  }
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
};

/** Groups ordered problems into sections, preserving first-seen section order. */
const sectionize = (problems, keyFn) => {
  const map = new Map();
  for (const p of problems) {
    const k = keyFn(p);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push({ slug: p.slug, title: p.title, difficulty: p.difficulty });
  }
  return [...map.entries()].map(([name, problems]) => ({ name, problems }));
};

const roadmaps = [];
const add = (r) => {
  const count = r.sections.reduce((n, s) => n + s.problems.length, 0);
  roadmaps.push({ ...r, problemCount: count });
  console.log(`  ${r.name.padEnd(42)} ${String(count).padStart(4)} problems`);
};

// ------------------------------------------------------------- NeetCode
console.log("NeetCode");
const nc = (await getJson("https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json")).map((p) => ({
  slug: String(p.link).replace(/\/$/, ""),
  title: p.problem,
  difficulty: D(p.difficulty),
  pattern: p.pattern,
  blind75: Boolean(p.blind75),
  nc150: Boolean(p.neetcode150),
}));
const NC = { author: "NeetCode", source: "https://neetcode.io/practice", kind: "community" };
add({
  ...NC,
  slug: "blind-75",
  name: "Blind 75",
  description: "The original 75-problem list that started the curated-list trend. The fastest way to cover every core pattern once.",
  estimatedWeeks: 6,
  sections: sectionize(nc.filter((p) => p.blind75), (p) => p.pattern),
});
add({
  ...NC,
  slug: "neetcode-150",
  name: "NeetCode 150",
  description: "Blind 75 plus 75 more, grouped by pattern in the order NeetCode teaches them. The most popular all-round list.",
  estimatedWeeks: 12,
  sections: sectionize(nc.filter((p) => p.nc150), (p) => p.pattern),
});
add({
  ...NC,
  slug: "neetcode-all",
  name: "NeetCode All",
  description: "Every problem on NeetCode's practice site, by pattern. For after the 150, or for going deep on one topic.",
  estimatedWeeks: 30,
  sections: sectionize(nc, (p) => p.pattern),
});

// -------------------------------------------------------------- Grind
console.log("Grind");
const g169 = JSON.parse(readFileSync(path.join(SOURCES, "grind169.json"), "utf8")).problems.map((p) => ({
  ...p,
  difficulty: D(p.difficulty),
}));
const bySlug169 = new Map(g169.map((p) => [p.slug, p]));
const g75 = JSON.parse(readFileSync(path.join(SOURCES, "grind75.json"), "utf8")).problems.map((p) => ({
  ...bySlug169.get(p.slug),
  slug: p.slug,
  week: p.week,
}));
const GRIND = { author: "Yangshun Tay", source: "https://www.techinterviewhandbook.org/grind75", kind: "community" };
add({
  ...GRIND,
  slug: "grind-75",
  name: "Grind 75",
  description: "By the author of Blind 75: an updated 75, scheduled week by week (8 weeks at about 8 hours a week).",
  estimatedWeeks: 8,
  sections: sectionize(g75, (p) => p.week),
});
add({
  ...GRIND,
  slug: "grind-169",
  name: "Grind 169",
  description: "The full Grind list, grouped by topic. Grind 75 is its highest-priority subset.",
  estimatedWeeks: 20,
  sections: sectionize(g169, (p) => titleCase(p.topic)),
});

// ------------------------------------------------------ LeetCode Patterns
console.log("LeetCode Patterns");
const lp = (await getJson("https://raw.githubusercontent.com/seanprashad/leetcode-patterns/main/src/data/questions.json")).data
  .filter((q) => !q.premium)
  .map((q) => ({
    slug: q.slug,
    title: q.title,
    difficulty: D(q.difficulty),
    pattern: Array.isArray(q.pattern) && q.pattern.length ? q.pattern[0] : "Other",
    companies: q.companies || [],
  }));
add({
  slug: "leetcode-patterns",
  name: "LeetCode Patterns",
  author: "Sean Prashad",
  source: "https://seanprashad.com/leetcode-patterns/",
  kind: "community",
  description: "Grouped by the underlying technique rather than data structure, so you learn to recognise the pattern.",
  estimatedWeeks: 14,
  sections: sectionize(lp, (p) => p.pattern),
});

// Company lists derived from the same dataset's frequency data.
const COMPANIES = [
  ["google", "Google"],
  ["amazon", "Amazon"],
  ["facebook", "Meta"],
  ["microsoft", "Microsoft"],
  ["bloomberg", "Bloomberg"],
  ["apple", "Apple"],
];
for (const [slug, label] of COMPANIES) {
  const ranked = lp
    .map((p) => ({ ...p, f: (p.companies.find((c) => c.slug === slug) || {}).frequency || 0 }))
    .filter((p) => p.f > 0)
    .sort((a, b) => b.f - a.f)
    .slice(0, 50);
  add({
    slug: `company-${slug}`,
    name: `${label}: most asked`,
    author: "Derived from LeetCode Patterns",
    source: "https://seanprashad.com/leetcode-patterns/",
    kind: "company",
    description: `The ${ranked.length} problems most often reported at ${label}, ranked by frequency in LeetCode Patterns' company data.`,
    estimatedWeeks: 5,
    sections: sectionize(
      ranked.map((p, i) => ({ ...p, tier: i < 15 ? "Most frequent" : i < 35 ? "Frequent" : "Also reported" })),
      (p) => p.tier,
    ),
  });
}

// -------------------------------------------------- LeetCode study plans
console.log("LeetCode study plans");
const PLANS = [
  ["leetcode-75", "LeetCode 75", "LeetCode's own 75 essentials, best for 1 to 3 months of prep.", 6],
  ["top-interview-150", "Top Interview 150", "LeetCode's 150 classic interview questions, best for 3+ months of prep.", 12],
  ["top-100-liked", "Top 100 Liked", "The 100 most-liked problems on LeetCode.", 9],
  ["binary-search", "Binary Search", "LeetCode's binary search plan (free problems).", 3],
  ["dynamic-programming", "Dynamic Programming", "LeetCode's dynamic programming plan (free problems).", 4],
  ["graph-theory", "Graph Theory", "LeetCode's graph plan: DFS, BFS, union-find, shortest paths (free problems).", 4],
  ["programming-skills", "Programming Skills", "LeetCode's warm-up plan for language fluency and simulation (free problems).", 3],
];
for (const [slug, name, description, weeks] of PLANS) {
  const d = await gql(
    "query q($s:String!){ studyPlanV2Detail(planSlug:$s){ planSubGroups{ name questions{ titleSlug title difficulty paidOnly } } } }",
    { s: slug },
  );
  add({
    slug: `lc-${slug}`,
    name,
    author: "LeetCode",
    source: `https://leetcode.com/studyplan/${slug}/`,
    kind: "official",
    description,
    estimatedWeeks: weeks,
    sections: d.studyPlanV2Detail.planSubGroups
      .map((g) => ({
        name: g.name,
        problems: g.questions
          .filter((q) => !q.paidOnly)
          .map((q) => ({ slug: q.titleSlug, title: q.title, difficulty: D(q.difficulty) })),
      }))
      .filter((g) => g.problems.length),
  });
  await sleep(400);
}

// ------------------------------------------------- LeetCode Explore cards
console.log("LeetCode Explore");
const CARDS = [
  ["top-interview-questions-easy", "Top Interview Questions: Easy", 3],
  ["top-interview-questions-medium", "Top Interview Questions: Medium", 6],
  ["top-interview-questions-hard", "Top Interview Questions: Hard", 5],
];
for (const [card, name, weeks] of CARDS) {
  const d = await gql("query q($c:String!){ chapters(cardSlug:$c){ title items { id type paidOnly } } }", { c: card });
  const sections = [];
  for (const ch of d.chapters) {
    const problems = [];
    for (const it of ch.items.filter((i) => i.type === 1 && !i.paidOnly)) {
      const q = await gql("query q($id:String!){ item(id:$id){ question{ titleSlug title difficulty } } }", { id: it.id });
      if (q.item?.question) problems.push({ slug: q.item.question.titleSlug, title: q.item.question.title, difficulty: D(q.item.question.difficulty) });
      await sleep(120);
    }
    if (problems.length) sections.push({ name: ch.title, problems });
  }
  add({
    slug: `lc-${card}`,
    name,
    author: "LeetCode",
    source: `https://leetcode.com/explore/interview/card/${card}/`,
    kind: "official",
    description: "LeetCode's classic Explore collection of top interview questions, by topic.",
    estimatedWeeks: weeks,
    sections,
  });
}

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), roadmaps }, null, 1) + "\n");
console.log(`\n${roadmaps.length} roadmaps -> ${path.relative(root, OUT)}`);
