"use client";

import { useState, useEffect } from "react";

const FULL_TEXT =
  "First-year Data Science student at UNSW Sydney, exploring the overlap between machine learning, statistics, and software that actually does something useful. I tutor students one-on-one across STEM and beyond. When I'm away from a screen, I'm playing clarinet or saxophone \u2014 or slowly getting better at guitar.";

type Phase = "idle" | "thinking" | "typing" | "done";

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "var(--accent)",
            animation: `dot-bounce 1.2s ${i * 0.18}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}

export function TypewriterAbout() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [charCount, setCharCount] = useState(0);

  // Kick off the sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("thinking"), 500);
    const t2 = setTimeout(() => setPhase("typing"), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Typing loop
  useEffect(() => {
    if (phase !== "typing") return;
    if (charCount >= FULL_TEXT.length) {
      setPhase("done");
      return;
    }
    // Slightly faster in the middle of a word, slower at punctuation
    const ch = FULL_TEXT[charCount];
    const isPunct = ".,:;—!?".includes(ch);
    const delay = isPunct ? 80 + Math.random() * 60 : 18 + Math.random() * 22;
    const t = setTimeout(() => setCharCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [phase, charCount]);

  return (
    // Reserve approximate height so links don't jump as text fills in
    <p
      className="text-[0.9375rem] leading-[1.8]"
      style={{ color: "var(--text-muted)", minHeight: "9rem" }}
    >
      {phase === "idle" && null}

      {phase === "thinking" && (
        <span
          className="text-[0.75rem] tracking-widest uppercase"
          style={{ color: "var(--accent)", opacity: 0.7 }}
        >
          generating
          <ThinkingDots />
        </span>
      )}

      {(phase === "typing" || phase === "done") && (
        <>
          {FULL_TEXT.slice(0, charCount)}
          {phase === "typing" && (
            <span
              className="animate-pulse"
              style={{ color: "var(--accent)", marginLeft: 1 }}
            >
              ▋
            </span>
          )}
        </>
      )}
    </p>
  );
}
