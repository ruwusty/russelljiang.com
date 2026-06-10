"use client";

import { useEffect, useRef, useState } from "react";

// 18×8 pixel cat, facing right. X = ink, o = eye (bg), c = collar (accent)
export const FRAME_A = [
  ".X.........XX..XX.",
  ".X.........XXXXXX.",
  ".X.........XoXXoX.",
  "..X........XXXXXX.",
  "..XXXXXXXXXXcXXX..",
  "..XXXXXXXXXXXXXX..",
  "...XX..XX..XX.XX..",
  "...XX..XX..XX.XX..",
];

export const FRAME_B = [
  ".X.........XX..XX.",
  ".X.........XXXXXX.",
  ".X.........XoXXoX.",
  "..X........XXXXXX.",
  "..XXXXXXXXXXcXXX..",
  "..XXXXXXXXXXXXXX..",
  "..XX..XX...XX..XX.",
  "..XX..XX...XX..XX.",
];

const PIXEL_FILL: Record<string, string> = {
  X: "var(--ink)",
  o: "var(--bg)",
  c: "var(--accent)",
};

export function Sprite({ frame, flip }: { frame: string[]; flip: boolean }) {
  return (
    <svg
      viewBox="0 0 18 8"
      width="90"
      height="40"
      style={{
        shapeRendering: "crispEdges",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      aria-hidden="true"
    >
      {frame.flatMap((row, y) =>
        row.split("").map((ch, x) =>
          ch === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PIXEL_FILL[ch]} />
          )
        )
      )}
    </svg>
  );
}

const WALK_MS = 3200;
const STEP_MS = 260;

export function LostCat() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [x, setX] = useState(8);
  const [dir, setDir] = useState(1);
  const [stepFrame, setStepFrame] = useState(false);
  const [fleeing, setFleeing] = useState(false);
  const xRef = useRef(8);
  const lastFleeRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // wander: pick a spot, stroll there, pause, repeat
  useEffect(() => {
    if (reduced !== false) return;
    let t: ReturnType<typeof setTimeout>;
    const hop = () => {
      const next = 4 + Math.random() * 78;
      setDir(next > xRef.current ? 1 : -1);
      xRef.current = next;
      setX(next);
      t = setTimeout(hop, WALK_MS + 600 + Math.random() * 2400);
    };
    t = setTimeout(hop, 900);
    return () => clearTimeout(t);
  }, [reduced]);

  // little legs
  useEffect(() => {
    if (reduced !== false) return;
    const tick = setInterval(() => setStepFrame((s) => !s), STEP_MS);
    return () => clearInterval(tick);
  }, [reduced]);

  // it does not want to be caught
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced !== false) return;
    const area = areaRef.current;
    if (!area) return;
    const now = performance.now();
    if (now - lastFleeRef.current < 900) return;
    const rect = area.getBoundingClientRect();
    const catPx = (xRef.current / 100) * rect.width + 45; // sprite centre
    const mousePx = e.clientX - rect.left;
    if (Math.abs(mousePx - catPx) > 80) return;
    lastFleeRef.current = now;
    const away = mousePx > catPx ? -1 : 1;
    const next = Math.min(82, Math.max(2, xRef.current + away * (24 + Math.random() * 12)));
    setDir(next > xRef.current ? 1 : -1);
    xRef.current = next;
    setFleeing(true);
    setX(next);
    setTimeout(() => setFleeing(false), 750);
  };

  return (
    <div
      ref={areaRef}
      className="relative mt-12 h-[120px]"
      style={{ borderBottom: "1px solid var(--line)" }}
      aria-hidden="true"
      onMouseMove={onMouseMove}
    >
      <div
        className="absolute bottom-0"
        style={{
          left: `${x}%`,
          transition: reduced
            ? undefined
            : fleeing
              ? "left 700ms cubic-bezier(0.25, 0.8, 0.4, 1)"
              : `left ${WALK_MS}ms linear`,
        }}
      >
        <Sprite frame={stepFrame ? FRAME_B : FRAME_A} flip={dir < 0} />
      </div>
    </div>
  );
}
