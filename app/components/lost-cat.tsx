"use client";

import { useEffect, useRef, useState } from "react";

// procedurally rasterized pixel cat: shapes → grid → shading → outline,
// painted to a canvas at ~60fps. all colours come from the site palette.
const W = 48;
const H = 28;
const SCALE = 5;

const EMPTY = 0;
const FUR = 1; // --soft
const BELLY = 2; // --faint
const INK = 3; // --ink (outline, eye, nose)
const COLLAR = 4; // --accent

function rasterize(
  timeMs: number,
  walkPhase: number,
  walking: boolean,
  blink: boolean
): Uint8Array {
  const g = new Uint8Array(W * H);
  const set = (x: number, y: number, v: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = v;
  };
  const get = (x: number, y: number) =>
    x < 0 || x >= W || y < 0 || y >= H ? EMPTY : g[y * W + x];

  const bob = walking ? Math.abs(Math.sin(walkPhase)) * 1.1 : 0;
  const bodyY = 15.5 - bob;
  const headX = 37;
  const headY = 9 - bob * 0.7;

  // body (ellipse)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - 20.5) / 12.5;
      const dy = (y - bodyY) / 6.2;
      if (dx * dx + dy * dy <= 1) g[y * W + x] = FUR;
    }
  }
  // head (circle)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - headX) / 6.4;
      const dy = (y - headY) / 5.4;
      if (dx * dx + dy * dy <= 1) g[y * W + x] = FUR;
    }
  }
  // ears (triangles off the head top)
  for (const apexX of [headX - 4, headX + 4]) {
    const apexY = Math.round(headY - 8.2);
    for (let r = 0; r < 5; r++) {
      const half = Math.round(r * 0.8);
      for (let x = apexX - half; x <= apexX + half; x++) {
        set(x, apexY + r, FUR);
      }
    }
  }
  // legs (3px wide, swinging with gait, slight lift)
  const legBaseX = [11, 16, 26, 31];
  const legPhase = [0, Math.PI, Math.PI * 1.5, Math.PI * 0.5];
  const legTop = Math.round(bodyY + 3);
  legBaseX.forEach((bx, i) => {
    const swing = walking ? Math.sin(walkPhase + legPhase[i]) * 2.4 : 0;
    const lift = walking
      ? Math.max(0, Math.sin(walkPhase + legPhase[i] + Math.PI / 2)) * 1.4
      : 0;
    const x = Math.round(bx + swing);
    const bottom = H - 1 - Math.round(lift);
    for (let y = legTop; y <= bottom; y++) {
      set(x, y, FUR);
      set(x + 1, y, FUR);
      set(x + 2, y, FUR);
    }
  });
  // tail (animated curve off the rump, 3px brush)
  const wave = walking ? 1.1 : 2.2;
  for (let s = 0; s <= 22; s++) {
    const u = s / 22;
    const tx = 10 - u * 8;
    const ty = bodyY - 2 - u * 9 + Math.sin(timeMs * 0.0035 + u * 3.2) * wave;
    const rx = Math.round(tx);
    const ry = Math.round(ty);
    set(rx, ry, FUR);
    set(rx + 1, ry, FUR);
    set(rx, ry + 1, FUR);
  }
  // belly + muzzle shading
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g[y * W + x] === FUR && y > bodyY + 1.5 && x > 9 && x < 32) {
        g[y * W + x] = BELLY;
      }
    }
  }
  for (let y = Math.round(headY + 1); y <= Math.round(headY + 3); y++) {
    for (let x = headX + 1; x <= headX + 6; x++) {
      if (get(x, y) === FUR) set(x, y, BELLY);
    }
  }
  // outline pass: any filled cell touching empty becomes ink
  const edges: number[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = g[y * W + x];
      if (
        v !== EMPTY &&
        (get(x - 1, y) === EMPTY ||
          get(x + 1, y) === EMPTY ||
          get(x, y - 1) === EMPTY ||
          get(x, y + 1) === EMPTY)
      ) {
        edges.push(y * W + x);
      }
    }
  }
  for (const i of edges) g[i] = INK;
  // collar (band at the neck)
  for (let y = Math.round(headY + 4); y <= Math.round(headY + 6); y++) {
    for (let x = 31; x <= 33; x++) {
      if (get(x, y) !== EMPTY) set(x, y, COLLAR);
    }
  }
  // eye (2×2, blink keeps the bottom row)
  const ex = headX + 2;
  const ey = Math.round(headY - 2);
  set(ex, ey + 1, INK);
  set(ex + 1, ey + 1, INK);
  if (!blink) {
    set(ex, ey, INK);
    set(ex + 1, ey, INK);
  }
  // nose
  set(headX + 6, Math.round(headY + 1), INK);

  return g;
}

const SPEED_PCT_PER_S = 7;
const GAIT_RAD_PER_S = 9;
const BLINK_EVERY_MS = 2800;
const BLINK_MS = 150;

export function LostCat() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced === null) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * SCALE * dpr;
    canvas.height = H * SCALE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const readColors = (): Record<number, string> => {
      const cs = getComputedStyle(document.documentElement);
      const v = (name: string) => cs.getPropertyValue(name).trim();
      return {
        [FUR]: v("--soft"),
        [BELLY]: v("--faint"),
        [INK]: v("--ink"),
        [COLLAR]: v("--accent"),
      };
    };
    let colors = readColors();
    const observer = new MutationObserver(() => {
      colors = readColors();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const paint = (g: Uint8Array, flip: boolean) => {
      ctx.clearRect(0, 0, W * SCALE, H * SCALE);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const v = g[y * W + x];
          if (v === EMPTY) continue;
          ctx.fillStyle = colors[v];
          const px = flip ? W - 1 - x : x;
          ctx.fillRect(px * SCALE, y * SCALE, SCALE, SCALE);
        }
      }
    };

    if (reduced) {
      paint(rasterize(0, 0, false, false), false);
      return () => observer.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let x = 12;
    let dir = 1;
    let mode: "walk" | "idle" = "idle";
    let target = 12;
    let idleUntil = last + 1200;
    let gait = 0;

    const loop = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;

      if (mode === "walk") {
        x += dir * SPEED_PCT_PER_S * dt;
        gait += GAIT_RAD_PER_S * dt;
        const arrived = dir > 0 ? x >= target : x <= target;
        if (arrived) {
          x = target;
          mode = "idle";
          idleUntil = now + 1500 + Math.random() * 3500;
        }
      } else if (now >= idleUntil) {
        target = 4 + Math.random() * 78;
        dir = target > x ? 1 : -1;
        mode = "walk";
      }

      const blink = now % BLINK_EVERY_MS < BLINK_MS;
      paint(rasterize(now, gait, mode === "walk", blink), dir < 0);
      wrap.style.left = `${x}%`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <div
      className="relative mt-12 h-[150px] overflow-hidden"
      style={{ borderBottom: "1px solid var(--line)" }}
      aria-hidden="true"
    >
      <div ref={wrapRef} className="absolute bottom-0" style={{ left: "12%" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: W * SCALE, height: H * SCALE }}
        />
      </div>
    </div>
  );
}
