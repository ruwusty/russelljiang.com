"use client";

import { useEffect, useRef } from "react";

const HEIGHT = 320;
const TINE_OFFSETS = [-5, 0, 5];

interface Stone {
  x: number; // 0..1
  y: number; // 0..1
  rx: number;
  ry: number;
  tilt: number;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

// the stones are placed fresh each day, the same for everyone
function todaysStones(): Stone[] {
  const rng = mulberry32(hashString(new Date().toISOString().slice(0, 10)));
  const count = 3 + Math.floor(rng() * 3);
  const stones: Stone[] = [];
  for (let i = 0; i < count; i++) {
    stones.push({
      x: 0.12 + rng() * 0.76,
      y: 0.15 + rng() * 0.7,
      rx: 10 + rng() * 14,
      ry: 7 + rng() * 9,
      tilt: (rng() - 0.5) * 0.9,
    });
  }
  return stones;
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function ZenGarden() {
  const sandRef = useRef<HTMLCanvasElement>(null);
  const stoneRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const sand = sandRef.current;
    const stoneCanvas = stoneRef.current;
    if (!wrap || !sand || !stoneCanvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const stones = todaysStones();

    const drawStones = () => {
      const ctx = stoneCanvas.getContext("2d");
      if (!ctx) return;
      const w = stoneCanvas.width / dpr;
      const h = stoneCanvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      const fill = cssVar("--soft");
      const edge = cssVar("--ink");
      for (const s of stones) {
        ctx.save();
        ctx.translate(s.x * w, s.y * h);
        ctx.rotate(s.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, s.rx, s.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = edge;
        ctx.stroke();
        ctx.restore();
      }
    };

    const resize = () => {
      const w = wrap.clientWidth;
      for (const canvas of [sand, stoneCanvas]) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(HEIGHT * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${HEIGHT}px`;
        canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      drawStones(); // resizing smooths the sand; the stones remain
    };

    resize();
    window.addEventListener("resize", resize);

    // re-ink the stones when the theme flips
    const observer = new MutationObserver(drawStones);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  const pointAt = (e: React.PointerEvent) => {
    const rect = sandRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const rake = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = sandRef.current?.getContext("2d");
    if (!ctx) return;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    // tines run perpendicular to the stroke
    const nx = -dy / len;
    const ny = dx / len;
    ctx.strokeStyle = cssVar("--faint");
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    for (const off of TINE_OFFSETS) {
      ctx.beginPath();
      ctx.moveTo(from.x + nx * off, from.y + ny * off);
      ctx.lineTo(to.x + nx * off, to.y + ny * off);
      ctx.stroke();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    lastRef.current = pointAt(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!lastRef.current) return;
    const next = pointAt(e);
    rake(lastRef.current, next);
    lastRef.current = next;
  };

  const onPointerUp = () => {
    lastRef.current = null;
  };

  const smooth = () => {
    const sand = sandRef.current;
    const ctx = sand?.getContext("2d");
    if (!sand || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.clearRect(0, 0, sand.width / dpr, sand.height / dpr);
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative mt-2 select-none"
        style={{ border: "1px solid var(--line)", height: HEIGHT, touchAction: "none" }}
      >
        <canvas
          ref={sandRef}
          className="absolute inset-0 cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="a bed of sand. drag to rake."
        />
        <canvas ref={stoneRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      </div>

      <div className="mt-4 flex items-baseline gap-4 text-[12px]">
        <button onClick={smooth} className="tui-btn text-[12px]" style={{ color: "var(--green)" }}>
          [smooth the sand]
        </button>
        <span className="text-[11px] lowercase" style={{ color: "var(--faint)" }}>
          drag to rake. the stones move tomorrow. nothing is saved, that&apos;s the point.
        </span>
      </div>
    </div>
  );
}
