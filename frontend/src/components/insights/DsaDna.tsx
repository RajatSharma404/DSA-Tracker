"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Dna } from "lucide-react";
import { toast } from "sonner";
import { dsaApi, type Topic } from "@/lib/api";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * "DSA DNA" — a generative fingerprint of your skill profile. Each topic is a
 * strand whose reach is your progress; the twist and phase come from a hash of
 * the whole profile, so no two users get the same shape. Exportable as PNG.
 */

const SIZE = 420;
const C = SIZE / 2;

/** FNV-1a: tiny deterministic hash for the profile signature. */
const hash = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

const readPalette = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    a: v("--accent-primary", "#00f0ff"),
    b: v("--accent-secondary", "#7000ff"),
    ink: v("--text-primary", "#f8fafc"),
    muted: v("--text-muted", "#64748b"),
    bg: v("--bg-card", "#0d0d14"),
    border: v("--border-medium", "rgba(255,255,255,.15)"),
  };
};

type Strand = { path: string; tip: [number, number]; progress: number; name: string; angle: number };

export function buildStrands(topics: Pick<Topic, "name" | "progressPercentage">[], seed: number): Strand[] {
  const n = Math.max(topics.length, 1);
  const twist = 0.35 + ((seed % 1000) / 1000) * 0.5; // 0.35..0.85 rad
  const phase = ((seed >>> 10) % 360) * (Math.PI / 180);
  const inner = 34;
  const outer = C - 38;
  return topics.map((t, i) => {
    const p = Math.max(0, Math.min(100, t.progressPercentage)) / 100;
    const angle = phase + (i / n) * Math.PI * 2;
    const reach = inner + (outer - inner) * (0.12 + 0.88 * p);
    const end: [number, number] = [C + Math.cos(angle + twist) * reach, C + Math.sin(angle + twist) * reach];
    const ctrlR = reach * 0.62;
    const ctrl: [number, number] = [
      C + Math.cos(angle - twist * 0.6) * ctrlR,
      C + Math.sin(angle - twist * 0.6) * ctrlR,
    ];
    const start: [number, number] = [C + Math.cos(angle) * inner, C + Math.sin(angle) * inner];
    return {
      path: `M${start[0].toFixed(1)},${start[1].toFixed(1)} Q${ctrl[0].toFixed(1)},${ctrl[1].toFixed(1)} ${end[0].toFixed(1)},${end[1].toFixed(1)}`,
      tip: end,
      progress: p,
      name: t.name,
      angle,
    };
  });
}

export function DsaDna() {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [palette, setPalette] = useState<ReturnType<typeof readPalette> | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    dsaApi.getTopics().then(setTopics).catch(() => setTopics([]));
  }, []);

  // Re-read resolved colors whenever the theme changes (needed for PNG export too).
  useEffect(() => {
    const id = requestAnimationFrame(() => setPalette(readPalette()));
    return () => cancelAnimationFrame(id);
  }, [theme]);

  const usable = useMemo(
    () => (topics ?? []).filter((t) => t.totalProblems > 0 && !/auto-synced/i.test(t.name)).slice(0, 24),
    [topics],
  );
  const signature = useMemo(
    () => hash(usable.map((t) => `${t.name}:${t.progressPercentage}`).join("|")),
    [usable],
  );
  const strands = useMemo(() => buildStrands(usable, signature), [usable, signature]);
  const code = `DNA-${signature.toString(16).toUpperCase().padStart(8, "0").slice(0, 6)}`;
  const totals = usable.reduce(
    (acc, t) => ({ solved: acc.solved + t.solvedProblems, total: acc.total + t.totalProblems }),
    { solved: 0, total: 0 },
  );
  const strongest = [...usable].sort((a, b) => b.progressPercentage - a.progressPercentage)[0];
  const archetype = !strongest
    ? "Explorer"
    : totals.solved / Math.max(1, totals.total) > 0.75
      ? "Grandmaster"
      : usable.filter((t) => t.progressPercentage >= 50).length >= usable.length / 2
        ? "Generalist"
        : `${strongest.name.split(/[ &/]/)[0]} Specialist`;

  const exportPng = async () => {
    const svg = svgRef.current;
    if (!svg || !palette) return;
    const W = 1200;
    const H = 630;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
    await img.decode();

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, W, H);
    try {
      const grad = ctx.createRadialGradient(330, 315, 40, 330, 315, 420);
      grad.addColorStop(0, /^#[0-9a-f]{6}$/i.test(palette.a) ? `${palette.a}22` : "transparent");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } catch {
      // decorative only
    }
    ctx.drawImage(img, 60, 45, 540, 540);

    ctx.fillStyle = palette.muted;
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText("MY DSA DNA", 660, 190);
    ctx.fillStyle = palette.ink;
    ctx.font = "800 64px system-ui, sans-serif";
    ctx.fillText(archetype, 660, 270, 500);
    ctx.font = "500 30px system-ui, sans-serif";
    ctx.fillStyle = palette.ink;
    ctx.fillText(`${totals.solved} / ${totals.total} problems`, 660, 340);
    ctx.fillStyle = palette.muted;
    ctx.fillText(`${usable.length} patterns · strongest: ${strongest?.name ?? "—"}`, 660, 385, 500);
    ctx.font = "600 24px ui-monospace, monospace";
    ctx.fillStyle = palette.a;
    ctx.fillText(code, 660, 460);
    ctx.fillStyle = palette.muted;
    ctx.font = "500 20px system-ui, sans-serif";
    ctx.fillText("DSA Tracker Pro", 660, 560);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsa-dna-${code.toLowerCase()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("DNA card saved");
    }, "image/png");
  };

  if (!topics || !palette) return <div className="surface h-[520px] shimmer" aria-busy="true" />;

  const active = hovered !== null ? strands[hovered] : null;

  return (
    <section className="surface p-5 sm:p-6" aria-labelledby="dna-title">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">DSA DNA</p>
          <h2 id="dna-title" className="font-display text-xl font-bold mt-1">
            Your skill fingerprint
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            One strand per pattern. Longer strands mean deeper mastery. The twist is unique to your profile.
          </p>
        </div>
        <button
          onClick={exportPng}
          disabled={usable.length === 0}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] px-3 py-2 text-xs font-semibold hover:bg-[var(--bg-hover)] disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Download size={14} /> Share card
        </button>
      </header>

      {usable.length === 0 ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">
          <Dna className="mx-auto mb-2 text-[var(--accent-primary)]" />
          Your DNA appears once topics load.
        </div>
      ) : (
        <div className="mt-4 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-[460px] mx-auto"
            role="img"
            aria-label={`Skill fingerprint across ${usable.length} topics`}
          >
            <defs>
              <linearGradient id="dna-strand" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={palette.a} />
                <stop offset="100%" stopColor={palette.b} />
              </linearGradient>
              <radialGradient id="dna-core">
                <stop offset="0%" stopColor={palette.a} stopOpacity="0.55" />
                <stop offset="100%" stopColor={palette.a} stopOpacity="0" />
              </radialGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <circle
                key={f}
                cx={C}
                cy={C}
                r={34 + (C - 72) * f}
                fill="none"
                stroke={palette.border}
                strokeDasharray="2 5"
                strokeWidth={1}
              />
            ))}
            <polygon
              points={strands.map((s) => s.tip.join(",")).join(" ")}
              fill={palette.a}
              fillOpacity={0.07}
              stroke={palette.a}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
            {strands.map((s, i) => (
              <g
                key={s.name}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <path d={s.path} stroke="transparent" strokeWidth={14} fill="none" />
                <path
                  d={s.path}
                  stroke="url(#dna-strand)"
                  strokeWidth={hovered === i ? 3.5 : 2}
                  strokeLinecap="round"
                  fill="none"
                  opacity={hovered === null || hovered === i ? 0.35 + s.progress * 0.65 : 0.15}
                  style={{ transition: "opacity .2s, stroke-width .2s" }}
                />
                <circle
                  cx={s.tip[0]}
                  cy={s.tip[1]}
                  r={hovered === i ? 6 : 3 + s.progress * 3}
                  fill={s.progress >= 0.999 ? palette.b : palette.a}
                  stroke={palette.bg}
                  strokeWidth={2}
                />
              </g>
            ))}
            <circle cx={C} cy={C} r={60} fill="url(#dna-core)" />
            <circle cx={C} cy={C} r={20} fill={palette.bg} stroke={palette.a} strokeWidth={1.5} />
            <text x={C} y={C + 4} textAnchor="middle" fontSize="11" fontWeight={700} fill={palette.ink} fontFamily="ui-monospace, monospace">
              {Math.round((totals.solved / Math.max(1, totals.total)) * 100)}%
            </text>
          </svg>

          <div className="space-y-4">
            <div>
              <div className="eyebrow">Archetype</div>
              <div className="font-display text-2xl font-bold text-gradient">{archetype}</div>
            </div>
            <div>
              <div className="eyebrow">Signature</div>
              <div className="font-mono text-sm">{code}</div>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 min-h-[76px]" aria-live="polite">
              {active ? (
                <>
                  <div className="text-sm font-semibold">{active.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {Math.round(active.progress * 100)}% mastered
                  </div>
                </>
              ) : (
                <div className="text-xs text-[var(--text-muted)]">Hover a strand to inspect a pattern.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
