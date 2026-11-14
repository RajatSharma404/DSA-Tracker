"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

/**
 * The landing page's centrepiece: one problem's recall over 60 days.
 *
 * Recall follows R(t) = 0.9^(t / S), so S is the day recall reaches 90%.
 * A review is scheduled when recall would drop below TARGET; each review
 * resets recall to 100% and multiplies stability, so the next drop is slower.
 * The dashed line is the same problem solved once and never revisited.
 */

const DAYS = 60;
const TARGET = 0.85;
const FIRST_STABILITY = 1.5;
const GROWTH = 2.2;

const W = 640;
const H = 320;
const PAD = { l: 8, r: 64, t: 16, b: 16 };

const recall = (dt: number, s: number) => Math.pow(0.9, dt / s);
const gap = (s: number) => (s * Math.log(TARGET)) / Math.log(0.9);

type Review = { day: number; stability: number };

function schedule(): Review[] {
  const reviews: Review[] = [{ day: 0, stability: FIRST_STABILITY }];
  for (;;) {
    const last = reviews[reviews.length - 1];
    const next = last.day + gap(last.stability);
    if (next >= DAYS) break;
    reviews.push({ day: next, stability: last.stability * GROWTH });
  }
  return reviews;
}

const REVIEWS = schedule();

function recallAt(day: number) {
  let r = REVIEWS[0];
  for (const rv of REVIEWS) if (rv.day <= day) r = rv;
  return recall(day - r.day, r.stability);
}

const x = (day: number) => PAD.l + (day / DAYS) * (W - PAD.l - PAD.r);
const y = (r: number) => PAD.t + (1 - r) * (H - PAD.t - PAD.b);
const f = (n: number) => n.toFixed(2);

function buildPaths() {
  let withReviews = "";
  REVIEWS.forEach((rv, i) => {
    const end = i + 1 < REVIEWS.length ? REVIEWS[i + 1].day : DAYS;
    withReviews += `${i ? " L" : "M"}${f(x(rv.day))} ${f(y(1))}`;
    for (let d = rv.day + 0.25; d < end; d += 0.25) withReviews += ` L${f(x(d))} ${f(y(recall(d - rv.day, rv.stability)))}`;
    withReviews += ` L${f(x(end))} ${f(y(recall(end - rv.day, rv.stability)))}`;
  });
  let once = `M${f(x(0))} ${f(y(1))}`;
  for (let d = 0.25; d <= DAYS; d += 0.25) once += ` L${f(x(d))} ${f(y(recall(d, FIRST_STABILITY)))}`;
  return { withReviews, once };
}

const pct = (n: number) => `${Math.round(n * 100)}%`;
const fmtDay = (d: number) => `day ${Math.round(d)}`;

export function ForgettingCurve() {
  const { withReviews, once } = useMemo(() => buildPaths(), []);
  const lineRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);

  // Draw the line in once, when the figure first scrolls into view.
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      el.style.transition = reduce ? "none" : "stroke-dashoffset 2.4s cubic-bezier(.45,0,.2,1)";
      el.style.strokeDashoffset = "0";
      window.setTimeout(() => setDrawn(true), reduce ? 0 : 2200);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const day = ((px - PAD.l) / (W - PAD.l - PAD.r)) * DAYS;
    setCursor(Math.max(0, Math.min(DAYS, day)));
  };

  const day = cursor ?? DAYS;
  const r = recallAt(day);
  const r0 = recall(day, FIRST_STABILITY);
  const reviewsSoFar = REVIEWS.filter((rv) => rv.day > 0 && rv.day <= day).length;
  const upcoming = REVIEWS.find((rv) => rv.day > day);
  const lastReview = REVIEWS[REVIEWS.length - 1];
  const nextReviewDay = upcoming ? upcoming.day : lastReview.day + gap(lastReview.stability);

  return (
    <figure className="select-none">
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] text-[var(--lp-muted)]">
        <span>
          <span className="text-[var(--lp-text)]">207. Course Schedule</span> · recall over 60 days
        </span>
        <span className="hidden sm:inline">hover to scrub</span>
      </div>

      <div
        className="relative mt-6 touch-none"
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setCursor(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {/* Recall gridlines */}
          {[1, 0.85, 0.5, 0].map((g) => (
            <line
              key={g}
              x1={x(0)}
              x2={x(DAYS)}
              y1={y(g)}
              y2={y(g)}
              stroke="var(--lp-line)"
              strokeDasharray={g === 0.85 ? "2 4" : undefined}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* Review days */}
          {REVIEWS.slice(1).map((rv) => (
            <line
              key={rv.day}
              x1={x(rv.day)}
              x2={x(rv.day)}
              y1={y(1)}
              y2={y(0)}
              stroke="var(--lp-line)"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Solved once, never revisited */}
          <path d={once} fill="none" stroke="var(--lp-muted)" strokeWidth="1.25" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          {/* With reviews */}
          <path
            ref={lineRef}
            d={withReviews}
            fill="none"
            stroke="var(--lp-text)"
            strokeWidth="1.75"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Review markers */}
          {REVIEWS.slice(1).map((rv, i) => (
            <circle
              key={rv.day}
              cx={x(rv.day)}
              cy={y(1)}
              r="4"
              fill="var(--lp-accent)"
              stroke="var(--lp-bg)"
              strokeWidth="2"
              style={{ opacity: drawn ? 1 : 0, transition: `opacity .4s ${i * 0.12}s` }}
            />
          ))}

          {/* Scrubber */}
          {cursor !== null && (
            <g>
              <line x1={x(day)} x2={x(day)} y1={y(1)} y2={y(0)} stroke="var(--lp-subtle)" vectorEffect="non-scaling-stroke" />
              <circle cx={x(day)} cy={y(r0)} r="3" fill="var(--lp-bg)" stroke="var(--lp-muted)" strokeWidth="1.5" />
              <circle cx={x(day)} cy={y(r)} r="4" fill="var(--lp-text)" stroke="var(--lp-bg)" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Axis labels as HTML so they stay legible at any width */}
        {[
          [1, "100%"],
          [0.85, "85%"],
          [0.5, "50%"],
        ].map(([g, label]) => (
          <span
            key={label as string}
            className="pointer-events-none absolute whitespace-nowrap pl-3 font-mono text-[10px] text-[var(--lp-muted)]"
            style={{ left: `${(x(DAYS) / W) * 100}%`, top: `${(y(g as number) / H) * 100}%`, transform: "translateY(-50%)" }}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        className="mt-3 flex justify-between font-mono text-[10px] text-[var(--lp-muted)]"
        style={{ marginRight: `${(PAD.r / W) * 100}%` }}
      >
        {[0, 15, 30, 45, 60].map((d) => (
          <span key={d}>{d === 0 ? "solved" : `day ${d}`}</span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[var(--lp-subtle)]">
        <span className="flex items-center gap-2">
          <span className="h-px w-5 bg-[var(--lp-text)]" /> with reviews
        </span>
        <span className="flex items-center gap-2">
          <span className="w-5 border-t border-dashed border-[var(--lp-muted)]" /> solved once
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--lp-accent)]" /> review, when recall nears 85%
        </span>
      </div>

      <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-[var(--lp-line)] pt-5">
        <div>
          <dt className="font-mono text-[10px] text-[var(--lp-muted)]">{cursor === null ? "after 60 days" : fmtDay(day)}</dt>
          <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight">{pct(r)}</dd>
          <dd className="text-xs text-[var(--lp-subtle)]">with {reviewsSoFar} short reviews</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] text-[var(--lp-muted)]">solved once</dt>
          <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-[var(--lp-muted)]">{pct(r0)}</dd>
          <dd className="text-xs text-[var(--lp-subtle)]">green check on LeetCode</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] text-[var(--lp-muted)]">next review</dt>
          <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight">
            {fmtDay(nextReviewDay)}
          </dd>
          <dd className="flex items-center gap-1.5 text-xs text-[var(--lp-subtle)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--lp-accent)]" /> gaps keep growing
          </dd>
        </div>
      </dl>
    </figure>
  );
}
