"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Node {
  x: number;
  y: number;
  activation: number;
}

interface Signal {
  from: number;
  to: number;
  t: number;
  speed: number;
}

interface State {
  nodes: Node[];
  edges: [number, number][];
  signals: Signal[];
  animId: number;
}

const CONNECTION_DIST = 130;
const DECAY = 0.012;

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const stateRef = useRef<State>({ nodes: [], edges: [], signals: [], animId: 0 });
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme !== "light";
    const [r, g, b] = isDark ? [165, 180, 252] : [99, 102, 241];

    const buildGraph = () => {
      const W = canvas.width;
      const H = canvas.height;
      const spacing = 85;
      const nodes: Node[] = [];

      for (let x = spacing / 2; x < W; x += spacing) {
        for (let y = spacing / 2; y < H; y += spacing) {
          nodes.push({
            x: x + (Math.random() - 0.5) * spacing * 0.55,
            y: y + (Math.random() - 0.5) * spacing * 0.55,
            activation: 0,
          });
        }
      }

      const edges: [number, number][] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < CONNECTION_DIST) {
            edges.push([i, j]);
          }
        }
      }
      stateRef.current.nodes = nodes;
      stateRef.current.edges = edges;
      stateRef.current.signals = [];
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildGraph();
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    // Autonomous random firing every ~2.5s
    const autoFire = setInterval(() => {
      const { nodes } = stateRef.current;
      if (!nodes.length) return;
      const idx = Math.floor(Math.random() * nodes.length);
      nodes[idx].activation = Math.min(1, nodes[idx].activation + 0.6);
    }, 2500);

    let last = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const { nodes, edges, signals } = stateRef.current;
      const mouse = mouseRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update node activations
      nodes.forEach((node, i) => {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          node.activation = Math.min(1, node.activation + (1 - dist / 130) * 0.07);
        }
        node.activation = Math.max(0, node.activation - DECAY);

        // Fire signals to neighbours when active enough
        if (node.activation > 0.35 && Math.random() < 0.04) {
          edges.forEach(([a, b]) => {
            const other = a === i ? b : b === i ? a : -1;
            if (other < 0) return;
            if (!signals.find((s) => s.from === i && s.to === other)) {
              signals.push({ from: i, to: other, t: 0, speed: 0.5 + Math.random() * 0.5 });
            }
          });
        }
      });

      // Draw edges
      edges.forEach(([a, b]) => {
        const na = nodes[a];
        const nb = nodes[b];
        const boost = (na.activation + nb.activation) * 0.07;
        const opacity = (isDark ? 0.05 : 0.04) + boost;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update & draw signals
      stateRef.current.signals = signals.filter((s) => s.t <= 1);
      signals.forEach((sig) => {
        sig.t += dt * sig.speed;
        if (sig.t > 1) {
          nodes[sig.to].activation = Math.min(1, nodes[sig.to].activation + 0.45);
          return;
        }
        const na = nodes[sig.from];
        const nb = nodes[sig.to];
        const x = na.x + (nb.x - na.x) * sig.t;
        const y = na.y + (nb.y - na.y) * sig.t;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 5);
        grd.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const base = isDark ? 0.07 : 0.055;
        const opacity = base + node.activation * 0.55;
        const radius = 1.5 + node.activation * 2.5;

        // Glow for active nodes
        if (node.activation > 0.15) {
          const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 5);
          glow.addColorStop(0, `rgba(${r},${g},${b},${node.activation * 0.25})`);
          glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
      });

      stateRef.current.animId = requestAnimationFrame(tick);
    };

    stateRef.current.animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      clearInterval(autoFire);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
