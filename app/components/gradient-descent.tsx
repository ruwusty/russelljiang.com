"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

// Loss surface: bowl with texture so it has interesting contours
function loss(x: number, y: number): number {
  return 0.5 * (x - 0.2) ** 2 + 1.1 * (y + 0.15) ** 2 +
    0.12 * Math.sin(5.5 * x) * Math.cos(4 * y) +
    0.06 * Math.sin(9 * x);
}

function grad(x: number, y: number): [number, number] {
  const h = 0.001;
  return [
    (loss(x + h, y) - loss(x - h, y)) / (2 * h),
    (loss(x, y + h) - loss(x, y - h)) / (2 * h),
  ];
}

interface State {
  x: number;
  y: number;
  vx: number;
  vy: number;
  path: [number, number][];
  ep: number;
  animId: number;
  heatmap: ImageData | null;
}

const W = 224;
const H = 148;
const LR = 0.035;
const MOMENTUM = 0.78;
const DOMAIN = 1.0; // x,y range: [-DOMAIN, DOMAIN]

export function GradientDescent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>({
    x: 0.75, y: 0.7, vx: 0, vy: 0, path: [], ep: 0, animId: 0, heatmap: null,
  });
  const { resolvedTheme } = useTheme();

  const toCanvas = (x: number, y: number): [number, number] => [
    ((x + DOMAIN) / (2 * DOMAIN)) * W,
    ((y + DOMAIN) / (2 * DOMAIN)) * H,
  ];

  const reset = useCallback((sx?: number, sy?: number) => {
    const s = stateRef.current;
    s.x = sx ?? (Math.random() * 1.6 - 0.8);
    s.y = sy ?? (Math.random() * 1.6 - 0.8);
    s.vx = 0;
    s.vy = 0;
    s.path = [[s.x, s.y]];
    s.ep = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme !== "light";

    // Build heatmap once
    const img = ctx.createImageData(W, H);
    let minL = Infinity, maxL = -Infinity;
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const x = (px / W) * 2 * DOMAIN - DOMAIN;
        const y = (py / H) * 2 * DOMAIN - DOMAIN;
        const l = loss(x, y);
        if (l < minL) minL = l;
        if (l > maxL) maxL = l;
      }
    }
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const x = (px / W) * 2 * DOMAIN - DOMAIN;
        const y = (py / H) * 2 * DOMAIN - DOMAIN;
        const t = (loss(x, y) - minL) / (maxL - minL); // 0=low, 1=high
        const i = (py * W + px) * 4;
        if (isDark) {
          img.data[i]   = Math.round(8  + t * 85);
          img.data[i+1] = Math.round(5  + t * 12);
          img.data[i+2] = Math.round(28 + t * 110);
          img.data[i+3] = 255;
        } else {
          img.data[i]   = Math.round(235 - t * 130);
          img.data[i+1] = Math.round(228 - t * 160);
          img.data[i+2] = Math.round(255 - t * 40);
          img.data[i+3] = 255;
        }
      }
    }
    stateRef.current.heatmap = img;

    reset();

    const tick = () => {
      const s = stateRef.current;
      if (!s.heatmap) return;

      // One step per frame for a visible, satisfying descent
      if (s.ep < 600) {
        const [gx, gy] = grad(s.x, s.y);
        s.vx = MOMENTUM * s.vx - LR * gx;
        s.vy = MOMENTUM * s.vy - LR * gy;
        s.x = Math.max(-DOMAIN + 0.01, Math.min(DOMAIN - 0.01, s.x + s.vx));
        s.y = Math.max(-DOMAIN + 0.01, Math.min(DOMAIN - 0.01, s.y + s.vy));
        s.path.push([s.x, s.y]);
        s.ep++;
        if (s.path.length > 400) s.path = s.path.slice(-400);
      }

      // Draw heatmap
      ctx.putImageData(s.heatmap, 0, 0);

      // Draw path trail (fades from old to recent)
      for (let i = 1; i < s.path.length; i++) {
        const [x1, y1] = toCanvas(s.path[i - 1][0], s.path[i - 1][1]);
        const [x2, y2] = toCanvas(s.path[i][0], s.path[i][1]);
        const alpha = (i / s.path.length) * 0.75;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isDark
          ? `rgba(220,225,255,${alpha})`
          : `rgba(60,40,120,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw current point
      const [cx, cy] = toCanvas(s.x, s.y);

      // Outer glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      grd.addColorStop(0, isDark ? "rgba(200,210,255,0.35)" : "rgba(99,60,220,0.3)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(240,242,255,0.95)" : "rgba(60,40,140,0.95)";
      ctx.fill();

      // Epoch label
      ctx.font = "9px monospace";
      ctx.fillStyle = isDark ? "rgba(165,180,252,0.45)" : "rgba(99,102,241,0.5)";
      ctx.fillText(`epoch ${s.ep}`, 7, H - 7);

      s.animId = requestAnimationFrame(tick);
    };

    stateRef.current.animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(stateRef.current.animId);
  }, [resolvedTheme, reset]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const x = (px / W) * 2 * DOMAIN - DOMAIN;
      const y = (py / H) * 2 * DOMAIN - DOMAIN;
      reset(x, y);
    },
    [reset],
  );

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleClick}
        style={{
          display: "block",
          borderRadius: 8,
          border: "1px solid var(--border)",
          cursor: "crosshair",
        }}
      />
      <div
        className="flex items-center gap-4 text-[0.68rem] tracking-wide"
        style={{ color: "var(--tag-text)" }}
      >
        <span>gradient descent</span>
        <span style={{ color: "var(--border)" }}>·</span>
        <span>click to set start</span>
        <span style={{ color: "var(--border)" }}>·</span>
        <button
          onClick={() => reset()}
          style={{ color: "var(--accent)", cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit" }}
        >
          reset ↺
        </button>
      </div>
    </div>
  );
}
