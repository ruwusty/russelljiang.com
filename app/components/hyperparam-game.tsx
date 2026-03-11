"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";

// ── Loss surface ─────────────────────────────────────────────────────────────
function loss(x: number, y: number): number {
  return (
    0.28 * (x - 0.22) ** 2 +
    2.1  * (y + 0.18) ** 2 +
    0.13 * Math.sin(5 * x) * Math.cos(3.5 * y) +
    0.07 * Math.cos(7 * x) * Math.sin(2 * y)
  );
}
function grad(x: number, y: number): [number, number] {
  const h = 0.001;
  return [
    (loss(x + h, y) - loss(x - h, y)) / (2 * h),
    (loss(x, y + h) - loss(x, y - h)) / (2 * h),
  ];
}

// ── Types ────────────────────────────────────────────────────────────────────
type Optimizer = "sgd" | "momentum" | "adam";
type Status    = "running" | "converged" | "diverged";

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
  mx: number; my: number;
  wx: number; wy: number;
  t: number;
  path: [number, number][];
  ep: number;
  status: Status;
  colorIdx: number;
}

interface Anim {
  balls: Ball[];
  nextColor: number;
  animId: number;
  heatmap: ImageData | null;
  frameCount: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const W = 420;
const H = 152;
const DOMAIN   = 1.0;
const MAX_PATH = 300;
const MAX_BALLS = 5;

// 5 distinct colors — [dark, light] as RGB tuples
const PALETTE: [[number,number,number],[number,number,number]][] = [
  [[220, 225, 255], [55,  48,  163]],   // indigo
  [[110, 231, 183], [16,  185, 129]],   // emerald
  [[252, 211,  77], [180,  83,   9]],   // amber
  [[251, 113, 133], [225,  29,  72]],   // rose
  [[216, 180, 254], [109,  40, 217]],   // violet
];

const STATUS_RGB: Record<Status, [number,number,number]> = {
  running:   [160, 160, 160],
  converged: [74, 222, 128],
  diverged:  [248, 113, 133],
};

function toCanvas(x: number, y: number): [number, number] {
  return [
    ((x + DOMAIN) / (2 * DOMAIN)) * W,
    ((y + DOMAIN) / (2 * DOMAIN)) * H,
  ];
}

function makeBall(x: number, y: number, colorIdx: number): Ball {
  return {
    x, y, vx: 0, vy: 0, mx: 0, my: 0, wx: 0, wy: 0,
    t: 0, path: [[x, y]], ep: 0, status: "running",
    colorIdx: colorIdx % MAX_BALLS,
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export function HyperparamGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(true);

  // Hyperparams — state for rendering, ref for animation loop
  const [lr,  setLrState]  = useState(0.05);
  const [mom, setMomState] = useState(0.85);
  const [opt, setOptState] = useState<Optimizer>("momentum");
  const lrRef  = useRef(0.05);
  const momRef = useRef(0.85);
  const optRef = useRef<Optimizer>("momentum");

  const setLr  = (v: number)     => { setLrState(v);  lrRef.current  = v; };
  const setMom = (v: number)     => { setMomState(v); momRef.current = v; };
  const setOpt = (o: Optimizer)  => { setOptState(o); optRef.current = o; };

  // Display
  const [ballStatuses, setBallStatuses] = useState<Status[]>(["running", "running", "running"]);

  const animRef = useRef<Anim>({
    balls: [], nextColor: 0, animId: 0, heatmap: null, frameCount: 0,
  });

  const reset = useCallback(() => {
    const a = animRef.current;
    a.balls = [0, 1, 2].map(i =>
      makeBall(Math.random() * 1.6 - 0.8, Math.random() * 1.6 - 0.8, i)
    );
    a.nextColor = 3;
    setBallStatuses(["running", "running", "running"]);
  }, []);

  const spawnAt = useCallback((x: number, y: number) => {
    const a = animRef.current;
    if (a.balls.length >= MAX_BALLS) a.balls.shift();
    const ci = a.nextColor % MAX_BALLS;
    a.nextColor++;
    a.balls.push(makeBall(x, y, ci));
    setBallStatuses(a.balls.map(b => b.status));
  }, []);

  // Main animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme !== "light";
    isDarkRef.current = isDark;

    // Pre-render heatmap
    const img = ctx.createImageData(W, H);
    let minL = Infinity, maxL = -Infinity;
    for (let px = 0; px < W; px++)
      for (let py = 0; py < H; py++) {
        const l = loss((px / W) * 2 - 1, (py / H) * 2 - 1);
        if (l < minL) minL = l;
        if (l > maxL) maxL = l;
      }
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const t = (loss((px / W) * 2 - 1, (py / H) * 2 - 1) - minL) / (maxL - minL);
        const i = (py * W + px) * 4;
        img.data[i]   = isDark ? Math.round(8  + t * 80)  : Math.round(235 - t * 130);
        img.data[i+1] = isDark ? Math.round(5  + t * 10)  : Math.round(228 - t * 158);
        img.data[i+2] = isDark ? Math.round(28 + t * 105) : Math.round(255 - t * 38);
        img.data[i+3] = 255;
      }
    }
    animRef.current.heatmap = img;
    reset();

    const tick = () => {
      const a   = animRef.current;
      const dk  = isDarkRef.current;
      const lr  = lrRef.current;
      const mo  = momRef.current;
      const o   = optRef.current;
      if (!a.heatmap) { a.animId = requestAnimationFrame(tick); return; }

      // Step each running ball
      for (const b of a.balls) {
        if (b.status !== "running" || b.ep >= 1200) continue;
        if (Math.abs(b.x) > DOMAIN * 1.08 || Math.abs(b.y) > DOMAIN * 1.08) { b.status = "diverged"; continue; }
        if (loss(b.x, b.y) < 0.004) { b.status = "converged"; continue; }

        const [gx, gy] = grad(b.x, b.y);
        if (o === "sgd") {
          b.x -= lr * gx; b.y -= lr * gy; b.vx = 0; b.vy = 0;
        } else if (o === "momentum") {
          b.vx = mo * b.vx - lr * gx; b.vy = mo * b.vy - lr * gy;
          b.x += b.vx; b.y += b.vy;
        } else {
          const b1 = mo, b2 = 0.999, eps = 1e-8;
          b.t++;
          b.mx = b1*b.mx + (1-b1)*gx; b.my = b1*b.my + (1-b1)*gy;
          b.wx = b2*b.wx + (1-b2)*gx*gx; b.wy = b2*b.wy + (1-b2)*gy*gy;
          const p1t = 1 - Math.pow(b1, b.t), p2t = 1 - Math.pow(b2, b.t);
          b.x -= lr * (b.mx/p1t) / (Math.sqrt(b.wx/p2t) + eps);
          b.y -= lr * (b.my/p1t) / (Math.sqrt(b.wy/p2t) + eps);
          b.vx = 0; b.vy = 0;
        }
        b.path.push([b.x, b.y]);
        if (b.path.length > MAX_PATH) b.path = b.path.slice(-MAX_PATH);
        b.ep++;
      }

      // Draw
      ctx.putImageData(a.heatmap, 0, 0);

      for (const b of a.balls) {
        const base  = dk ? PALETTE[b.colorIdx][0] : PALETTE[b.colorIdx][1];
        const scol  = b.status === "running" ? base : STATUS_RGB[b.status];
        const [r,g,bv] = base;
        const [sr,sg,sbv] = scol;

        // Trail
        for (let i = 1; i < b.path.length; i++) {
          const [x1,y1] = toCanvas(b.path[i-1][0], b.path[i-1][1]);
          const [x2,y2] = toCanvas(b.path[i][0],   b.path[i][1]);
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
          ctx.strokeStyle = `rgba(${r},${g},${bv},${(i/b.path.length)*0.75})`;
          ctx.lineWidth = 1.5; ctx.stroke();
        }

        // Glow + dot
        const [cx,cy] = toCanvas(b.x, b.y);
        const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,14);
        grd.addColorStop(0, `rgba(${sr},${sg},${sbv},0.28)`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2);
        ctx.fillStyle=`rgba(${sr},${sg},${sbv},0.95)`; ctx.fill();
      }

      // Throttled React updates
      a.frameCount++;
      if (a.frameCount % 4 === 0) setBallStatuses(a.balls.map(b => b.status));

      a.animId = requestAnimationFrame(tick);
    };

    animRef.current.animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current.animId);
  }, [resolvedTheme, reset]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spawnAt(
      ((e.clientX - rect.left) / rect.width)  * 2 * DOMAIN - DOMAIN,
      ((e.clientY - rect.top)  / rect.height) * 2 * DOMAIN - DOMAIN,
    );
  }, [spawnAt]);

  // ── Derived display ──────────────────────────────────────────────────────
  const isDark   = resolvedTheme !== "light";
  const nConv    = ballStatuses.filter(s => s === "converged").length;
  const nDiv     = ballStatuses.filter(s => s === "diverged").length;
  const nRun     = ballStatuses.filter(s => s === "running").length;
  const allConv  = nConv === ballStatuses.length;
  const allDiv   = nDiv  === ballStatuses.length;

  const statusText =
    allConv ? `all ${nConv} converged ✓`
    : allDiv ? "all diverged — try lower lr"
    : [nRun  && `${nRun} running`,
       nConv && `${nConv} converged`,
       nDiv  && `${nDiv} diverged`].filter(Boolean).join(" · ");

  const statusColor = allConv ? "#4ade80" : allDiv ? "#f87171" : "var(--tag-text)";

  const optimizers: { key: Optimizer; label: string }[] = [
    { key: "sgd",      label: "SGD"      },
    { key: "momentum", label: "Momentum" },
    { key: "adam",     label: "Adam"     },
  ];

  return (
    <div className="space-y-3">
      {/* Canvas */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <canvas
          ref={canvasRef} width={W} height={H} onClick={handleClick}
          style={{ display: "block", width: "100%", cursor: "crosshair" }}
        />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <div className="space-y-1">
          <div className="flex justify-between text-[0.68rem]" style={{ color: "var(--tag-text)" }}>
            <span>learning rate</span>
            <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{lr.toFixed(3)}</span>
          </div>
          <input type="range" min={0.001} max={0.15} step={0.001} value={lr}
            onChange={e => setLr(+e.target.value)}
            style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[0.68rem]" style={{ color: "var(--tag-text)" }}>
            <span>{opt === "adam" ? "β₁" : "momentum"}</span>
            <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{mom.toFixed(2)}</span>
          </div>
          <input type="range" min={0} max={0.99} step={0.01} value={mom}
            onChange={e => setMom(+e.target.value)}
            style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }} />
        </div>
      </div>

      {/* Optimizer + dots + status + reset */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {optimizers.map(({ key, label }) => (
            <button key={key} onClick={() => setOpt(key)}
              className="text-[0.68rem] px-2.5 py-1 rounded-full tracking-wide transition-all duration-150"
              style={{
                border: "1px solid var(--border)",
                background: opt === key ? "var(--accent)" : "transparent",
                color: opt === key ? "var(--bg)" : "var(--tag-text)",
                cursor: "pointer",
              }}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto text-[0.68rem]">
          {/* Per-ball status dots */}
          <div className="flex items-center gap-[5px]">
            {ballStatuses.map((s, i) => {
              const [r,g,b] = s === "running"
                ? (isDark ? PALETTE[i % MAX_BALLS][0] : PALETTE[i % MAX_BALLS][1])
                : STATUS_RGB[s];
              return (
                <span key={i} style={{
                  display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                  background: `rgb(${r},${g},${b})`,
                  boxShadow: `0 0 5px rgba(${r},${g},${b},0.7)`,
                  opacity: s === "running" ? 1 : 0.65,
                  transition: "background 0.3s",
                }} />
              );
            })}
          </div>

          <span style={{ color: statusColor, transition: "color 0.3s" }}>{statusText}</span>

          <button onClick={reset}
            style={{ color: "var(--accent)", cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit" }}
            className="text-[0.68rem]">
            reset ↺
          </button>
        </div>
      </div>

      <p className="text-[0.65rem]" style={{ color: "var(--tag-text)", opacity: 0.5 }}>
        click canvas to spawn a ball · up to {MAX_BALLS}
      </p>
    </div>
  );
}
