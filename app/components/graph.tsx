"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}
interface Edge {
  a: number;
  b: number;
}

const NODE_COUNT = 34;
const EDGE_COUNT = 44;

export function Graph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let raf = 0;
    let mouseX = -9999;
    let mouseY = -9999;

    const hexToRgb = (hex: string) => {
      const clean = hex.replace("#", "").trim();
      const full =
        clean.length === 3
          ? clean
              .split("")
              .map((c) => c + c)
              .join("")
          : clean;
      const n = parseInt(full || "888888", 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };

    const readColor = (name: string, fb: string) => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return hexToRgb(v || fb);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const init = () => {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          r: 2,
        });
      }
      edges = [];
      const seen = new Set<string>();
      while (edges.length < EDGE_COUNT) {
        const a = Math.floor(Math.random() * NODE_COUNT);
        const b = Math.floor(Math.random() * NODE_COUNT);
        if (a === b) continue;
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ a, b });
      }
      const degree = new Array(NODE_COUNT).fill(0);
      for (const e of edges) {
        degree[e.a]++;
        degree[e.b]++;
      }
      nodes.forEach((n, i) => {
        n.r = 2 + Math.min(degree[i], 7) * 0.75;
      });
    };

    const step = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy + 0.01;
          const d = Math.sqrt(d2);
          const force = 900 / d2;
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const rest = 110;
        const k = 0.012;
        const f = (d - rest) * k;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      const cx = width / 2;
      const cy = height / 2;
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.0007;
        n.vy += (cy - n.y) * 0.0007;
      }

      if (mouseX > -1000) {
        for (const n of nodes) {
          const dx = n.x - mouseX;
          const dy = n.y - mouseY;
          const d2 = dx * dx + dy * dy + 100;
          if (d2 < 50000) {
            const d = Math.sqrt(d2);
            const f = 3500 / d2;
            n.vx += (dx / d) * f;
            n.vy += (dy / d) * f;
          }
        }
      }

      for (const n of nodes) {
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx * 0.22;
        n.y += n.vy * 0.22;
        const m = 24;
        if (n.x < m) {
          n.x = m;
          n.vx *= -0.3;
        }
        if (n.x > width - m) {
          n.x = width - m;
          n.vx *= -0.3;
        }
        if (n.y < m) {
          n.y = m;
          n.vy *= -0.3;
        }
        if (n.y > height - m) {
          n.y = height - m;
          n.vy *= -0.3;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const line = readColor("--muted", "#6b6b6b");
      const dot = readColor("--text", "#111111");

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${line.r},${line.g},${line.b},0.5)`;
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const n of nodes) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.2);
        grad.addColorStop(0, `rgba(${dot.r},${dot.g},${dot.b},0.35)`);
        grad.addColorStop(1, `rgba(${dot.r},${dot.g},${dot.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${dot.r},${dot.g},${dot.b},1)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!reduced) step();
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      init();
    };
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    resize();
    init();
    window.addEventListener("resize", onResize);
    if (!reduced) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        maskImage:
          "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, rgba(0,0,0,0.6) 70%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, rgba(0,0,0,0.6) 70%, transparent 100%)",
        opacity: 0.75,
      }}
    />
  );
}
