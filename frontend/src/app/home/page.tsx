"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { ForgettingCurve } from "@/components/landing/ForgettingCurve";
import { ROADMAP_NAMES } from "@/components/landing/landingData";

const GITHUB = "https://github.com/RajatSharma404/DSA-Tracker";
const DOCS = `${GITHUB}/tree/main/docs`;

/** Vesper, fixed for the landing page regardless of the app theme: monochrome plus one warm accent. */
const PALETTE = {
  "--lp-bg": "#101010",
  "--lp-surface": "#161616",
  "--lp-line": "#262626",
  "--lp-muted": "#7e7e7e",
  "--lp-subtle": "#a0a0a0",
  "--lp-text": "#ededed",
  "--lp-accent": "#ffc799",
} as CSSProperties;

/** Fades children in the first time they scroll into view. */
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
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <path d="M3 4 C 7 4, 9 15, 19 17" fill="none" stroke="var(--lp-text)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.5" cy="8.6" r="2.4" fill="var(--lp-accent)" />
    </svg>
  );
}

function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs text-[var(--lp-muted)]">
      <span className="text-[var(--lp-accent)]">{n}</span>
      <span className="h-px w-8 bg-[var(--lp-line)]" />
      {children}
    </p>
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
    tracker: "One ordered list: reviews that are due, the next problem in your roadmap, then a pick for your weakest pattern.",
  },
  {
    topic: "Understanding",
    leetcode: "Accepted or Wrong Answer.",
    tracker: "Step through your own code line by line, and see the mistakes you keep repeating.",
  },
  {
    topic: "Effort",
    leetcode: "",
    tracker: "Nothing changes in how you practise. Accepted submissions sync on their own, and LeetCode stays the judge.",
  },
];

const STEPS: Array<[string, string]> = [
  ["Connect LeetCode", "Add the browser extension, a userscript, or a one-click bookmark. Your LeetCode cookie never leaves your browser."],
  ["Pick a roadmap", "Blind 75, NeetCode 150, Grind 75, LeetCode 75 and 18 more. Problems you've already solved count straight away."],
  ["Do today's list", "Reviews first, then the next problem on your roadmap. Solve on LeetCode or in the built-in editor."],
];

const FEATURES: Array<[string, string]> = [
  ["Memory forecast", "Which problems you're about to forget, per topic, a month ahead."],
  ["A tracer that runs your code", "Step through your own JavaScript: each line, every variable, the array and the call stack."],
  ["Submit without leaving", "Send code to LeetCode's judge from the built-in editor and get the real verdict back."],
  ["Mistake patterns", "Wrong answers are grouped by cause, so you see the habit rather than the single bug."],
];

export default function LandingPage() {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const appHref = signedIn ? "/" : "/login?callbackUrl=%2F";
  const appLabel = signedIn ? "Open dashboard" : "Open the app";

  const navLink = "text-sm text-[var(--lp-subtle)] transition-colors hover:text-[var(--lp-text)]";
  const primaryBtn =
    "inline-flex items-center gap-2 rounded-md bg-[var(--lp-text)] px-4 py-2.5 text-sm font-medium text-[var(--lp-bg)] transition-colors hover:bg-white";
  const secondaryBtn =
    "inline-flex items-center gap-2 rounded-md border border-[var(--lp-line)] px-4 py-2.5 text-sm text-[var(--lp-text)] transition-colors hover:border-[var(--lp-muted)]";

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[var(--lp-bg)] text-[var(--lp-text)] antialiased" style={PALETTE}>
      <header className="sticky top-0 z-30 border-b border-[var(--lp-line)] bg-[var(--lp-bg)]/90 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/home" className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[15px] font-medium tracking-tight">DSA Tracker</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <a href="#why" className={navLink}>Why</a>
            <a href="#how" className={navLink}>How it works</a>
            <a href="#roadmaps" className={navLink}>Roadmaps</a>
            <a href={DOCS} target="_blank" rel="noopener noreferrer" className={navLink}>Docs</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={navLink} aria-label="GitHub">
              <Github size={16} />
            </a>
          </div>
          <Link href={appHref} className="inline-flex items-center gap-1.5 text-sm text-[var(--lp-text)] hover:text-white">
            {appLabel} <ArrowRight size={14} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-16 px-5 pb-24 pt-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:pt-24">
        <div>
          <Reveal>
            <p className="font-mono text-xs text-[var(--lp-muted)]">Free and open source · works with your LeetCode account</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-[42px] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[56px]">
              Solve it once.
              <br />
              <span className="text-[var(--lp-subtle)]">Still know it on interview day.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--lp-subtle)]">
              A LeetCode problem you solved three weeks ago is mostly gone. DSA Tracker records every accepted solve,
              tracks how well you still remember it, and brings it back for a short review just before it slips.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={appHref} className={primaryBtn}>
                Start practising <ArrowRight size={15} />
              </Link>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                <Github size={15} /> GitHub
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <dl className="mt-14 flex gap-10 font-mono text-xs text-[var(--lp-muted)]">
              {[
                ["22", "roadmaps"],
                ["466", "problems"],
                ["$0", "forever"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-sans text-xl font-medium text-[var(--lp-text)]">{n}</dt>
                  <dd className="mt-0.5">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <ForgettingCurve />
        </Reveal>
      </section>

      {/* Why */}
      <section id="why" className="border-t border-[var(--lp-line)]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <SectionLabel n="01">Why not just LeetCode</SectionLabel>
            <h2 className="mt-6 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-[40px]">
              LeetCode is the judge.
              <br />
              <span className="text-[var(--lp-subtle)]">This is the coach.</span>
            </h2>
          </Reveal>

          <div className="mt-14 border-t border-[var(--lp-line)]">
            <div className="hidden grid-cols-[200px_1fr_1fr] gap-10 border-b border-[var(--lp-line)] py-3 font-mono text-[11px] text-[var(--lp-muted)] md:grid">
              <span />
              <span>LeetCode on its own</span>
              <span className="text-[var(--lp-text)]">With DSA Tracker</span>
            </div>
            {COMPARISON.map((row, i) => (
              <Reveal key={row.topic} delay={i * 50}>
                <div className="grid gap-2 border-b border-[var(--lp-line)] py-6 md:grid-cols-[200px_1fr_1fr] md:gap-10">
                  <span className="text-[15px] font-medium">{row.topic}</span>
                  <span className="text-[15px] leading-relaxed text-[var(--lp-muted)]">{row.leetcode || "—"}</span>
                  <span className="text-[15px] leading-relaxed text-[var(--lp-text)]">{row.tracker}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-t border-[var(--lp-line)]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <SectionLabel n="02">How it works</SectionLabel>
            <h2 className="mt-6 text-3xl font-medium tracking-[-0.03em] sm:text-[40px]">Three steps, then just practise.</h2>
          </Reveal>

          <ol className="mt-14 grid border-t border-[var(--lp-line)] md:grid-cols-3">
            {STEPS.map(([title, body], i) => (
              <Reveal key={title} delay={i * 80}>
                <li className="h-full border-b border-[var(--lp-line)] py-8 md:border-b-0 md:pr-10 md:[&:not(:first-child)]:pl-10">
                  <span className="font-mono text-xs text-[var(--lp-muted)]">Step {i + 1}</span>
                  <h3 className="mt-4 text-lg font-medium">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--lp-subtle)]">{body}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-[var(--lp-line)] bg-[var(--lp-line)] sm:grid-cols-2">
            {FEATURES.map(([title, body]) => (
              <div key={title} className="bg-[var(--lp-bg)] p-7">
                <h3 className="text-[15px] font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--lp-subtle)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmaps */}
      <section id="roadmaps" className="border-t border-[var(--lp-line)]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <SectionLabel n="03">Built-in roadmaps</SectionLabel>
            <h2 className="mt-6 max-w-2xl text-3xl font-medium tracking-[-0.03em] sm:text-[40px]">
              The lists people actually use,
              <br />
              <span className="text-[var(--lp-subtle)]">taken from their original sources.</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <ol className="mt-12 columns-1 gap-10 sm:columns-2 lg:columns-3">
              {ROADMAP_NAMES.map((name, i) => (
                <li key={name} className="flex break-inside-avoid items-baseline gap-4 border-b border-[var(--lp-line)] py-3 text-[15px]">
                  <span className="w-5 shrink-0 font-mono text-[11px] tabular-nums text-[var(--lp-muted)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {name}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--lp-line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-24 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="max-w-xl text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-[40px]">
              Keep the practice you&apos;ve already done.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-wrap gap-3">
              <Link href={appHref} className={primaryBtn}>
                {appLabel} <ArrowRight size={15} />
              </Link>
              <a href={DOCS} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                Read the docs <ArrowUpRight size={15} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-[var(--lp-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--lp-muted)]">
          <span className="flex items-center gap-2.5">
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
