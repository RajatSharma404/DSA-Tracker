"use client";

import { useEffect, useRef, useState } from "react";
import { PATTERNS, PROBLEMS } from "./landingData";

/**
 * The landing centerpiece: the NeetCode 150 as a field of tiles. Problems are
 * solved in roadmap order, then fade along the same forgetting curve the app
 * uses, R = (1 + t / 9S)^-1. A scheduler reviews whatever is about to slip;
 * every review raises stability, so tiles stay bright for longer each time.
 */

// Rosé Pine (main)
const C = {
  base: [25, 23, 36],
  overlay: [38, 35, 58],
  hl: [64, 61, 82],
  text: [224, 222, 244],
  love: [235, 111, 146],
  gold: [246, 193, 119],
  rose: [235, 188, 186],
  pine: [49, 116, 143],
  foam: [156, 207, 216],
  iris: [196, 167, 231],
} as const;
const HUES = [C.foam, C.iris, C.rose, C.gold, C.pine, C.love];

const rgb = (c: readonly number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a: readonly number[], b: readonly number[], t: number) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t);

const DAYS_PER_SECOND = 1.7;
const SOLVE_EVERY = 0.11; // seconds
const REVIEW_EVERY = 0.32; // seconds
const REVIEW_BELOW = 0.8;
const DUE_BELOW = 0.7;

type Cell = { solvedAt: number | null; last: number; S: number; reviews: number; pulse: number };
const recall = (c: Cell, now: number) => (c.solvedAt === null ? 0 : 1 / (1 + (now - c.last) / (9 * c.S)));

export interface FieldStats {
  day: number;
  solved: number;
  recall: number;
  reviews: number;
}

export function MemoryField({ onStats }: { onStats?: (s: FieldStats) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number; r: number } | null>(null);
  const hoverRef = useRef<number | null>(null);
  const cellsRef = useRef<Cell[]>([]);
  const nowRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fresh = (): Cell[] => PROBLEMS.map(() => ({ solvedAt: null, last: 0, S: 1, reviews: 0, pulse: 0 }));
    let cells = fresh();
    cellsRef.current = cells;
    let now = 0; // sim days
    let solveTimer = 0;
    let reviewTimer = 0;
    let nextToSolve = 0;
    let reviews = 0;
    let doneFor = 0;
    const history: number[] = [];
    let historyTimer = 0;
    let statsTimer = 0;

    let cols = 15;
    let rows = 10;
    let cell = 20;
    let gap = 5;
    let gridX = 0;
    let gridY = 0;
    let W = 0;
    let H = 0;
    const SPARK_H = 46;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      cols = W < 420 ? 10 : 15;
      rows = Math.ceil(PROBLEMS.length / cols);
      gap = W < 420 ? 4 : 6;
      cell = Math.floor((W - gap * (cols - 1)) / cols);
      const gridH = rows * cell + (rows - 1) * gap;
      H = gridH + 18 + SPARK_H;
      gridX = Math.round((W - (cols * cell + (cols - 1) * gap)) / 2);
      gridY = 0;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const step = (dt: number) => {
      now += dt * DAYS_PER_SECOND;
      solveTimer += dt;
      reviewTimer += dt;

      while (solveTimer >= SOLVE_EVERY && nextToSolve < cells.length) {
        solveTimer -= SOLVE_EVERY;
        const c = cells[nextToSolve++];
        c.solvedAt = now;
        c.last = now;
        c.S = 1.4 + Math.random() * 1.2;
        c.pulse = 1;
      }
      if (reviewTimer >= REVIEW_EVERY) {
        reviewTimer = 0;
        let worst = -1;
        let worstR = REVIEW_BELOW;
        for (let i = 0; i < cells.length; i++) {
          const r = recall(cells[i], now);
          if (cells[i].solvedAt !== null && r < worstR) {
            worst = i;
            worstR = r;
          }
        }
        if (worst >= 0) {
          const c = cells[worst];
          c.last = now;
          c.S = Math.min(c.S * 2.4, 400);
          c.reviews += 1;
          c.pulse = 1;
          reviews += 1;
        }
      }
      for (const c of cells) c.pulse = Math.max(0, c.pulse - dt * 1.6);

      historyTimer += dt;
      if (historyTimer > 0.15) {
        historyTimer = 0;
        const solved = cells.filter((c) => c.solvedAt !== null);
        history.push(solved.length ? solved.reduce((s, c) => s + recall(c, now), 0) / solved.length : 1);
        if (history.length > 160) history.shift();
      }

      if (nextToSolve >= cells.length) {
        doneFor += dt;
        if (doneFor > 14) {
          cells = fresh();
          cellsRef.current = cells;
          now = 0;
          nextToSolve = 0;
          reviews = 0;
          doneFor = 0;
          history.length = 0;
        }
      }
      nowRef.current = now;

      statsTimer += dt;
      if (onStats && statsTimer > 0.2) {
        statsTimer = 0;
        const solved = cells.filter((c) => c.solvedAt !== null);
        onStats({
          day: Math.floor(now),
          solved: solved.length,
          recall: solved.length ? solved.reduce((s, c) => s + recall(c, now), 0) / solved.length : 1,
          reviews,
        });
      }
    };

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const radius = Math.max(3, cell * 0.22);
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = gridX + col * (cell + gap);
        const y = gridY + row * (cell + gap);
        const hue = HUES[PROBLEMS[i][1] % HUES.length];

        if (c.solvedAt === null) {
          roundRect(x + 0.5, y + 0.5, cell - 1, cell - 1, radius);
          ctx.fillStyle = rgb(C.overlay);
          ctx.fill();
        } else {
          const r = recall(c, now);
          const strength = 0.18 + 0.82 * Math.pow(r, 1.6);
          roundRect(x, y, cell, cell, radius);
          ctx.fillStyle = rgb(mix(C.overlay, hue, strength));
          ctx.fill();
          if (r < DUE_BELOW) {
            ctx.beginPath();
            ctx.arc(x + cell - cell * 0.2, y + cell * 0.2, Math.max(2, cell * 0.09), 0, Math.PI * 2);
            ctx.fillStyle = rgb(C.love, 0.9);
            ctx.fill();
          }
          if (c.pulse > 0) {
            const p = 1 - c.pulse;
            roundRect(x - p * 6, y - p * 6, cell + p * 12, cell + p * 12, radius + p * 4);
            ctx.strokeStyle = rgb(hue, c.pulse * 0.7);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
        if (hoverRef.current === i) {
          roundRect(x - 2, y - 2, cell + 4, cell + 4, radius + 2);
          ctx.strokeStyle = rgb(C.text, 0.9);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Average recall sparkline
      const top = gridY + rows * (cell + gap) - gap + 18;
      const left = gridX;
      const width = cols * (cell + gap) - gap;
      ctx.strokeStyle = rgb(C.hl);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      const y70 = top + SPARK_H * (1 - 0.7);
      ctx.beginPath();
      ctx.moveTo(left, y70);
      ctx.lineTo(left + width, y70);
      ctx.stroke();
      ctx.setLineDash([]);
      if (history.length > 1) {
        ctx.beginPath();
        history.forEach((v, k) => {
          const px = left + (k / 159) * width;
          const py = top + SPARK_H * (1 - v);
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = rgb(C.foam);
        ctx.lineWidth = 1.75;
        ctx.stroke();
      }
    };

    layout();
    const ro = new ResizeObserver(() => {
      layout();
      draw();
    });
    ro.observe(wrap);

    // Pause while off-screen.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.01 });
    io.observe(wrap);

    let raf = 0;
    let lastT = performance.now();
    if (reduced) {
      for (let t = 0; t < 24; t += 0.05) step(0.05);
      draw();
    } else {
      const loop = (t: number) => {
        const dt = Math.min(0.05, (t - lastT) / 1000);
        lastT = t;
        if (visible && !document.hidden) {
          step(dt);
          draw();
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - gridX;
      const my = e.clientY - rect.top - gridY;
      const col = Math.floor(mx / (cell + gap));
      const row = Math.floor(my / (cell + gap));
      const i = row * cols + col;
      const inside = col >= 0 && col < cols && row >= 0 && row < rows && i < PROBLEMS.length && mx % (cell + gap) <= cell && my % (cell + gap) <= cell;
      hoverRef.current = inside ? i : null;
      setHover(
        inside
          ? { i, x: gridX + col * (cell + gap) + cell / 2, y: gridY + row * (cell + gap), r: recall(cellsRef.current[i], nowRef.current) }
          : null,
      );
      if (reduced) draw();
    };
    const onLeave = () => {
      hoverRef.current = null;
      setHover(null);
      if (reduced) draw();
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [onStats]);

  const hovered = hover ? PROBLEMS[hover.i] : null;
  const solved = hover ? cellsRef.current[hover.i]?.solvedAt !== null : false;

  return (
    <div ref={wrapRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="block w-full cursor-crosshair"
        role="img"
        aria-label="An animated field of the 150 NeetCode problems: tiles light up when solved, fade as they are forgotten, and brighten again when reviewed."
      />
      {hover && hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: hover.x, top: hover.y - 8, background: rgb(C.text), color: rgb(C.base) }}
        >
          <div className="font-medium">{hovered[0]}</div>
          <div style={{ opacity: 0.75 }}>
            {PATTERNS[hovered[1]]} · {solved ? `recall ${Math.round(hover.r * 100)}%` : "not solved yet"}
          </div>
        </div>
      )}
    </div>
  );
}
