"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { MemoryField, type FieldStats } from "@/components/landing/MemoryField";
import { ROADMAP_NAMES } from "@/components/landing/landingData";

const GITHUB = "https://github.com/RajatSharma404/DSA-Tracker";
const DOCS = `${GITHUB}/tree/main/docs`;

/** Rosé Pine (main), fixed for the landing page regardless of the app theme. */
const PALETTE = {
  "--lp-bg": "#191724",
  "--lp-surface": "#1f1d2e",
  "--lp-overlay": "#26233a",
  "--lp-line": "#2f2b44",
  "--lp-muted": "#6e6a86",
  "--lp-subtle": "#908caa",
  "--lp-text": "#e0def4",
  "--lp-love": "#eb6f92",
  "--lp-gold": "#f6c177",
  "--lp-rose": "#ebbcba",
  "--lp-pine": "#31748f",
  "--lp-foam": "#9ccfd8",
  "--lp-iris": "#c4a7e7",
} as CSSProperties;

/** Fades children up the first time they scroll into view. */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden>
      <rect width="28" height="28" rx="7" fill="var(--lp-overlay)" />
      <path d="M14 9.5 L9 18.5 M14 9.5 L19 18.5" stroke="var(--lp-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="9" r="3" fill="var(--lp-pine)" />
      <circle cx="9" cy="19" r="2.5" fill="var(--lp-rose)" />
      <circle cx="19" cy="19" r="2.5" fill="var(--lp-gold)" />
    </svg>
  );
}

const COMPARISON: Array<{ topic: string; leetcode: string; tracker: string }> = [
  {
    topic: "Remembering",
    leetcode: "A green check that stays forever, whether or not you could solve it again.",
    tracker: "Models how much of each problem you still remember and schedules a review right before it slips.",
  },
  {
    topic: "Roadmaps",
    leetcode: "Its own study plans, tracked one at a time.",
    tracker: "22 established lists (Blind 75, NeetCode 150, Grind 75, LeetCode 75…). One solve counts toward every list it's on.",
  },
  {
    topic: "What to do today",
    leetcode: "A problem of the day.",
    tracker: "One ordered list: reviews that are due, the next problem in your roadmap, then a focus pick for your weakest pattern.",
  },
  {
    topic: "Understanding",
    leetcode: "Accepted or Wrong Answer.",
    tracker: "Step through your own code line by line, get a review next to LeetCode's verdict, and see the mistakes you keep repeating.",
  },
  {
    topic: "Effort",
    leetcode: "",
    tracker: "Nothing changes in how you practise. Accepted submissions sync on their own, and LeetCode stays the judge.",
  },
];

const FEATURES: Array<{ title: string; body: string; art: ReactNode }> = [
  {
    title: "Memory forecast",
    body: "See which problems you're about to forget, per topic, a month ahead.",
    art: (
      <svg viewBox="0 0 160 70" className="h-16 w-full">
        <path d="M4 10 C 40 14, 60 40, 156 58" fill="none" stroke="var(--lp-line)" strokeWidth="2" />
        <path d="M4 10 C 30 12, 44 24, 62 30 L 62 12 C 90 14, 110 22, 156 32" fill="none" stroke="var(--lp-foam)" strokeWidth="2.2" />
        <circle cx="62" cy="12" r="3.5" fill="var(--lp-rose)" />
      </svg>
    ),
  },
  {
    title: "A tracer that runs your code",
    body: "Write any JavaScript and step through it: lines, variables, the array, the call stack.",
    art: (
      <div className="flex h-16 items-end gap-1.5">
        {[30, 55, 20, 75, 45, 60, 35].map((h, i) => (
          <span key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 1 || i === 3 ? "var(--lp-foam)" : "var(--lp-overlay)" }} />
        ))}
      </div>
    ),
  },
  {
    title: "Submit without leaving",
    body: "Send code to LeetCode's judge from the built-in editor and get the real verdict and percentiles back.",
    art: (
      <div className="flex h-16 flex-col justify-center gap-1.5 font-mono text-[11px]">
        <span style={{ color: "var(--lp-foam)" }}>✓ Accepted · 0 ms</span>
        <span style={{ color: "var(--lp-subtle)" }}>beats 100% runtime</span>
        <span style={{ color: "var(--lp-subtle)" }}>beats 91.4% memory</span>
      </div>
    ),
  },
  {
    title: "DSA DNA",
    body: "A generative fingerprint of your skills, unique to you, ready to share.",
    art: (
      <svg viewBox="0 0 120 70" className="h-16 w-full">
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (i / 11) * Math.PI * 2;
          const r = 14 + ((i * 37) % 19);
          return (
            <path
              key={i}
              d={`M60 35 Q ${(60 + Math.cos(a - 0.5) * r * 0.6).toFixed(2)} ${(35 + Math.sin(a - 0.5) * r * 0.6).toFixed(2)} ${(60 + Math.cos(a) * r).toFixed(2)} ${(35 + Math.sin(a) * r).toFixed(2)}`}
              stroke={i % 3 === 0 ? "var(--lp-rose)" : "var(--lp-iris)"}
              strokeWidth="1.6"
              fill="none"
            />
          );
        })}
        <circle cx="60" cy="35" r="5" fill="var(--lp-bg)" stroke="var(--lp-foam)" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const appHref = signedIn ? "/" : "/login?callbackUrl=%2F";
  const [stats, setStats] = useState<FieldStats>({ day: 0, solved: 0, recall: 1, reviews: 0 });
  const onStats = useCallback((s: FieldStats) => setStats(s), []);

  const navLink = "text-sm text-[var(--lp-subtle)] transition-colors hover:text-[var(--lp-text)]";

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[var(--lp-bg)] text-[var(--lp-text)] antialiased" style={PALETTE}>
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--lp-line)] bg-[var(--lp-bg)]/80 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/home" className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[15px] font-semibold tracking-tight">DSA Tracker</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <a href="#why" className={navLink}>Why</a>
            <a href="#how" className={navLink}>How it works</a>
            <a href="#roadmaps" className={navLink}>Roadmaps</a>
            <a href={DOCS} target="_blank" rel="noopener noreferrer" className={navLink}>Docs</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={navLink} aria-label="GitHub">
              <Github size={17} />
            </a>
          </div>
          <Link
            href={appHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lp-text)] px-4 py-1.5 text-sm font-medium text-[var(--lp-bg)] transition-transform hover:-translate-y-px"
          >
            {signedIn ? "Open dashboard" : "Open the app"} <ArrowRight size={14} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1fr_1.05fr] lg:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--lp-iris), transparent 65%)" }}
        />
        <div className="relative">
          <Reveal>
            <p className="font-mono text-xs tracking-wide text-[var(--lp-subtle)]">
              free &amp; open source · works with your LeetCode account
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[68px]">
              Solve it once.
              <br />
              <span className="text-[var(--lp-foam)]">Remember it</span> for
              <br />
              the interview.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[var(--lp-subtle)]">
              DSA Tracker sits on top of LeetCode. Follow a proven roadmap, let every accepted solve record itself, and
              review each problem right before you&apos;d forget it.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={appHref}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--lp-pine)] px-5 py-2.5 text-[15px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(49,116,143,0.7)] transition-transform hover:-translate-y-0.5"
              >
                Start practising <ArrowRight size={16} />
              </Link>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-line)] bg-[var(--lp-surface)] px-5 py-2.5 text-[15px] transition-colors hover:border-[var(--lp-muted)]"
              >
                <Github size={16} /> View on GitHub
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-[var(--lp-line)] pt-6">
              {[
                ["22", "built-in roadmaps"],
                ["466", "curated problems"],
                ["$0", "free and open source"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-3xl font-semibold tracking-tight">{n}</dt>
                  <dd className="mt-1 text-xs leading-snug text-[var(--lp-subtle)]">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Centerpiece */}
        <Reveal delay={200} className="relative">
          <figure className="rounded-[28px] border border-[var(--lp-line)] bg-[var(--lp-surface)] p-5 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.8)] sm:p-7">
            <div className="mb-5 flex items-baseline justify-between gap-4 font-mono text-[11px] text-[var(--lp-subtle)]">
              <span>NeetCode 150, simulated</span>
              <span className="tabular-nums">
                day {stats.day} · {stats.solved} solved · recall {Math.round(stats.recall * 100)}% · {stats.reviews} reviews
              </span>
            </div>
            <MemoryField onStats={onStats} />
            <figcaption className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--lp-subtle)]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--lp-foam)" }} /> solved, colour = pattern
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--lp-overlay)" }} /> fading from memory
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--lp-love)" }} /> due for review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4" style={{ background: "var(--lp-foam)" }} /> average recall
              </span>
            </figcaption>
          </figure>
          <p className="mt-4 text-center text-xs text-[var(--lp-muted)]">
            Every review makes a problem fade more slowly. Hover a tile to see it.
          </p>
        </Reveal>
      </section>

      {/* Why */}
      <section id="why" className="border-y border-[var(--lp-line)] bg-[var(--lp-surface)]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <p className="font-mono text-xs text-[var(--lp-subtle)]">why not just LeetCode?</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
              LeetCode is the judge.
              <br />
              <span className="text-[var(--lp-rose)]">This is the coach.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[var(--lp-subtle)]">
              Keep solving on LeetCode. The tracker remembers what you solved, how well you still know it, and what
              to do next, so a month of practice is still there on interview day.
            </p>
          </Reveal>

          <div className="mt-14 divide-y divide-[var(--lp-line)] border-y border-[var(--lp-line)]">
            <div className="hidden grid-cols-[180px_1fr_1fr] gap-8 py-3 font-mono text-[11px] text-[var(--lp-subtle)] md:grid">
              <span />
              <span>LeetCode on its own</span>
              <span>With DSA Tracker</span>
            </div>
            {COMPARISON.map((row, i) => (
              <Reveal key={row.topic} delay={i * 60}>
                <div className="grid gap-3 py-6 md:grid-cols-[180px_1fr_1fr] md:gap-8">
                  <span className="text-[15px] font-semibold">{row.topic}</span>
                  <span className="text-[15px] leading-relaxed text-[var(--lp-subtle)]">
                    {row.leetcode || <span className="text-[var(--lp-muted)]">—</span>}
                  </span>
                  <span className="text-[15px] leading-relaxed">{row.tracker}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <p className="font-mono text-xs text-[var(--lp-subtle)]">how it works</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Three steps, then just practise.</h2>
        </Reveal>
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            ["Connect LeetCode", "Add the browser extension, a userscript, or a one-click bookmark. Your LeetCode cookie never leaves your browser.", "var(--lp-pine)"],
            ["Pick a roadmap", "Blind 75, NeetCode 150, Grind 75, LeetCode 75 and 18 more. Your existing solves count immediately.", "var(--lp-gold)"],
            ["Do today's list", "Reviews first, then the next problem on your roadmap. Solve on LeetCode or in the built-in editor.", "var(--lp-rose)"],
          ].map(([title, body, color], i) => (
            <Reveal key={title} delay={i * 90}>
              <li className="group h-full rounded-3xl border border-[var(--lp-line)] bg-[var(--lp-surface)] p-7 transition-transform duration-300 hover:-translate-y-1">
                <span
                  className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-110"
                  style={{ background: color }}
                >
                  {i + 1}
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--lp-subtle)]">{body}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="h-full rounded-3xl border border-[var(--lp-line)] bg-[var(--lp-bg)] p-6">
                {f.art}
                <h3 className="mt-5 text-[15px] font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--lp-subtle)]">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Roadmaps marquee */}
      <section id="roadmaps" className="overflow-hidden border-y border-[var(--lp-line)] bg-[var(--lp-surface)] py-14">
        <Reveal className="mx-auto max-w-6xl px-5">
          <p className="font-mono text-xs text-[var(--lp-subtle)]">built-in roadmaps, from their original sources</p>
        </Reveal>
        <div className="group mt-6 flex w-max gap-3 [animation:lp-marquee_60s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:px-5 motion-reduce:[animation:none]">
          {[...ROADMAP_NAMES, ...ROADMAP_NAMES].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap rounded-full border border-[var(--lp-line)] bg-[var(--lp-bg)] px-4 py-2 text-[15px]"
              aria-hidden={i >= ROADMAP_NAMES.length}
            >
              {name}
            </span>
          ))}
        </div>
        <style>{`@keyframes lp-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-28 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
            Your next interview remembers
            <br />
            <span className="text-[var(--lp-foam)]">everything you practised.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={appHref}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--lp-text)] px-6 py-3 text-[15px] font-medium text-[var(--lp-bg)] transition-transform hover:-translate-y-0.5"
            >
              {signedIn ? "Open dashboard" : "Open the app"} <ArrowRight size={16} />
            </Link>
            <a
              href={DOCS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-line)] px-6 py-3 text-[15px] transition-colors hover:border-[var(--lp-muted)]"
            >
              Read the docs <ArrowUpRight size={16} />
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--lp-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--lp-subtle)]">
          <span className="flex items-center gap-2">
            <Mark /> DSA Tracker · MIT licensed
          </span>
          <div className="flex gap-6">
            <Link href={appHref} className="hover:text-[var(--lp-text)]">App</Link>
            <a href={DOCS} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--lp-text)]">Docs</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--lp-text)]">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
