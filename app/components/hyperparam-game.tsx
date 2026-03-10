"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";

// ── Loss surface ────────────────────────────────────────────────────────────
// Elongated bowl + ripples. The elongation is intentional: pure SGD oscillates
// in the steep axis while inching along the shallow one — great for showing
// why momentum / Adam exist.
function loss(x: number, y: number): number {
  return (
    0.28 * (x - 0.22) ** 2 +
    2.1 * (y + 0.18) ** 2 +
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
type Status = "running" | "converged" | "diverged";

interface Anim {
  x: number; y: number;
  vx: number; vy: number;       // SGD momentum
  mx: number; my: number;       // Adam 1st moment
  wx: number; wy: number;       // Adam 2nd moment
  t: number;                    // Adam timestep
  path: [number, number][];
  ep: number;
  animId: number;
  heatmap: ImageData | null;
  frameCount: number;
}

const W = 420;
const H = 152;
const DOMAIN = 1.0;

function toCanvas(x: number, y: number): [number, number] {
  return [((x + DOMAIN) / (2 * DOMAIN)) * W, ((y + DOMAIN) / (2 * DOMAIN)) * H];
}

// ── Component ────────────────────────────────────────────────────────────────
export function HyperparamGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  // Hyperparams — stored in both state (render) and ref (animation loop)
  const [lr, setLrState] = useState(0.05);
  const [mom, setMomState] = useState(0.85);
  const [opt, setOptState] = useState<Optimizer>("momentum");
  const lrRef = useRef(0.05);
  const momRef = useRef(0.85);
  const optRef = useRef<Optimizer>("momentum");

  const setLr = (v: number) => { setLrState(v); lrRef.current = v; };
  const setMom = (v: number) => { setMomState(v); momRef.current = v; };
  const setOpt = (o: Optimizer) => { setOptState(o); optRef.current = o; };

  // Display state updated from the anim loop
  const [epoch, setEpoch] = useState(0);
  const [lossVal, setLossVal] = useState(0);
  const [status, setStatus] = useState<Status>("running");

  const animRef = useRef<Anim>({
    x: 0.7, y: 0.65, vx: 0, vy: 0,
    mx: 0, my: 0, wx: 0, wy: 0, t: 0,
    path: [], ep: 0, animId: 0, heatmap: null, frameCount: 0,
  });

  const reset = useCallback((sx?: number, sy?: number) => {
    const a = animRef.current;
    a.x  = sx ?? (Math.random() * 1.6 - 0.8);
    a.y  = sy ?? (Math.random() * 1.6 - 0.8);
    a.vx = 0; a.vy = 0;
    a.mx = 0; a.my = 0;
    a.wx = 0; a.wy = 0;
    a.t  = 0;
    a.path = [[a.x, a.y]];
    a.ep = 0;
    setEpoch(0);
    setLossVal(loss(a.x, a.y));
    setStatus("running");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme !== "light";
    const [r, g, b] = isDark ? [165, 180, 252] : [99, 102, 241];

    // Build heatmap
    const img = ctx.createImageData(W, H);
    let minL = Infinity, maxL = -Infinity;
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const l = loss((px / W) * 2 * DOMAIN - DOMAIN, (py / H) * 2 * DOMAIN - DOMAIN);
        if (l < minL) minL = l;
        if (l > maxL) maxL = l;
      }
    }
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const t = (loss((px / W) * 2 * DOMAIN - DOMAIN, (py / H) * 2 * DOMAIN - DOMAIN) - minL) / (maxL - minL);
        const i = (py * W + px) * 4;
        if (isDark) {
          img.data[i]   = Math.round(8  + t * 80);
          img.data[i+1] = Math.round(5  + t * 10);
          img.data[i+2] = Math.round(28 + t * 105);
        } else {
          img.data[i]   = Math.round(235 - t * 130);
          img.data[i+1] = Math.round(228 - t * 158);
          img.data[i+2] = Math.round(255 - t * 38);
        }
        img.data[i+3] = 255;
      }
    }
    animRef.current.heatmap = img;
    reset();

    const tick = () => {
      const a = animRef.current;
      if (!a.heatmap) { a.animId = requestAnimationFrame(tick); return; }

      const currentStatus: Status =
        Math.abs(a.x) > DOMAIN * 1.05 || Math.abs(a.y) > DOMAIN * 1.05 ? "diverged"
        : loss(a.x, a.y) < 0.004 ? "converged"
        : "running";

      if (currentStatus === "running" && a.ep < 1200) {
        const lr  = lrRef.current;
        const mo  = momRef.current;
        const o   = optRef.current;
        const [gx, gy] = grad(a.x, a.y);

        if (o === "sgd") {
          a.x -= lr * gx;
          a.y -= lr * gy;
          a.vx = 0; a.vy = 0;
        } else if (o === "momentum") {
          a.vx = mo * a.vx - lr * gx;
          a.vy = mo * a.vy - lr * gy;
          a.x += a.vx;
          a.y += a.vy;
        } else {
          // Adam  (β1 = momentum slider, β2 = 0.999)
          const b1 = mo, b2 = 0.999, eps = 1e-8;
          a.t++;
          a.mx = b1 * a.mx + (1 - b1) * gx;
          a.my = b1 * a.my + (1 - b1) * gy;
          a.wx = b2 * a.wx + (1 - b2) * gx * gx;
          a.wy = b2 * a.wy + (1 - b2) * gy * gy;
          const mhx = a.mx / (1 - Math.pow(b1, a.t));
          const mhy = a.my / (1 - Math.pow(b1, a.t));
          const whx = a.wx / (1 - Math.pow(b2, a.t));
          const why = a.wy / (1 - Math.pow(b2, a.t));
          a.x -= lr * mhx / (Math.sqrt(whx) + eps);
          a.y -= lr * mhy / (Math.sqrt(why) + eps);
          a.vx = 0; a.vy = 0;
        }

        a.path.push([a.x, a.y]);
        if (a.path.length > 350) a.path = a.path.slice(-350);
        a.ep++;
      }

      // Draw
      ctx.putImageData(a.heatmap, 0, 0);

      // Path trail
      for (let i = 1; i < a.path.length; i++) {
        const [x1, y1] = toCanvas(a.path[i - 1][0], a.path[i - 1][1]);
        const [x2, y2] = toCanvas(a.path[i][0], a.path[i][1]);
        const alpha = (i / a.path.length) * 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isDark
          ? `rgba(220,225,255,${alpha})`
          : `rgba(50,30,110,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Ball
      const [cx, cy] = toCanvas(a.x, a.y);
      const ballColor = currentStatus === "converged"
        ? isDark ? "rgba(134,239,172,0.95)" : "rgba(22,163,74,0.95)"
        : currentStatus === "diverged"
        ? "rgba(252,165,165,0.95)"
        : isDark ? "rgba(240,242,255,0.95)" : "rgba(60,40,140,0.95)";

      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      grd.addColorStop(0, currentStatus === "converged"
        ? "rgba(134,239,172,0.3)"
        : isDark ? "rgba(200,210,255,0.28)" : "rgba(99,60,220,0.22)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = ballColor; ctx.fill();

      // React state update — throttled to every 4 frames
      a.frameCount++;
      if (a.frameCount % 4 === 0) {
        setEpoch(a.ep);
        setLossVal(loss(a.x, a.y));
        setStatus(currentStatus);
      }

      a.animId = requestAnimationFrame(tick);
    };

    animRef.current.animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current.animId);
  }, [resolvedTheme, reset]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    reset((px / W) * 2 * DOMAIN - DOMAIN, (py / H) * 2 * DOMAIN - DOMAIN);
  }, [reset]);

  const statusColor =
    status === "converged" ? "#4ade80"
    : status === "diverged" ? "#f87171"
    : "var(--tag-text)";

  const statusText =
    status === "converged" ? "converged ✓"
    : status === "diverged" ? "diverged — try lower lr"
    : `epoch ${epoch}`;

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
          ref={canvasRef}
          width={W}
          height={H}
          onClick={handleCanvasClick}
          style={{ display: "block", width: "100%", cursor: "crosshair" }}
        />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        {/* LR */}
        <div className="space-y-1">
          <div className="flex justify-between text-[0.68rem]" style={{ color: "var(--tag-text)" }}>
            <span>learning rate</span>
            <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
              {lr.toFixed(3)}
            </span>
          </div>
          <input
            type="range" min={0.001} max={0.4} step={0.001}
            value={lr}
            onChange={(e) => setLr(+e.target.value)}
            style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
          />
        </div>

        {/* Momentum */}
        <div className="space-y-1">
          <div className="flex justify-between text-[0.68rem]" style={{ color: "var(--tag-text)" }}>
            <span>{opt === "adam" ? "β₁" : "momentum"}</span>
            <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
              {mom.toFixed(2)}
            </span>
          </div>
          <input
            type="range" min={0} max={0.99} step={0.01}
            value={mom}
            onChange={(e) => setMom(+e.target.value)}
            style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Optimizer pills + status + reset */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {optimizers.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setOpt(key)}
              className="text-[0.68rem] px-2.5 py-1 rounded-full tracking-wide transition-all duration-150"
              style={{
                border: "1px solid var(--border)",
                background: opt === key ? "var(--accent)" : "transparent",
                color: opt === key ? "var(--bg)" : "var(--tag-text)",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto text-[0.68rem]">
          <span style={{ color: statusColor, transition: "color 0.3s" }}>
            {statusText}
          </span>
          {status !== "running" || epoch > 0 ? (
            <span style={{ color: "var(--tag-text)" }}>
              loss {Math.max(0, lossVal).toFixed(4)}
            </span>
          ) : null}
          <button
            onClick={() => reset()}
            style={{ color: "var(--accent)", cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit" }}
            className="text-[0.68rem]"
          >
            reset ↺
          </button>
        </div>
      </div>
    </div>
  );
}
