"use client";

import { useEffect, useRef, useState } from "react";

export const RM_EVENT = "site-rm-rf";

const DOOMED = [
  "/home/russell/bio.txt",
  "/home/russell/interests.md",
  "/home/russell/plan/2026/t1",
  "/home/russell/plan/2026/t2",
  "/home/russell/plan/2027",
  "/home/russell/plan/2028",
  "/home/russell/music/reeds (3-3.5)",
  "/home/russell/music/telecaster",
  "/home/russell/.dotfiles",
  "/var/www/guestbook.log",
  "/var/www/writing/vibe-coding-wont-save-you.mdx",
  "/usr/share/kaomoji/slots.json",
  "/usr/share/fonts/mincho",
  "/srv/currently/items.json",
  "/opt/vim/trial/leaderboard",
  "/opt/vim/motions/hjkl",
  "/etc/theme/warm-paper.conf",
  "/etc/motd",
  "/lib/whitespace/余白の美",
  "/boot/cursor.blink",
  "/bin/cat",
  "/home/russell",
];

type Phase = "off" | "deleting" | "aftermath" | "reveal";

const LINE_MS = 95;
const VISIBLE_LINES = 14;

export function RmTheater() {
  const [phase, setPhase] = useState<Phase>("off");
  const [lines, setLines] = useState<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    const later = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    const start = () => {
      clearTimers();
      setLines([]);
      setPhase("deleting");
      DOOMED.forEach((path, i) => {
        later(() => {
          setLines((current) => [...current.slice(-(VISIBLE_LINES - 1)), `removed '${path}'`]);
        }, i * LINE_MS);
      });
      const doneAt = DOOMED.length * LINE_MS;
      later(() => setPhase("aftermath"), doneAt + 600);
      later(() => setPhase("reveal"), doneAt + 2400);
      later(() => setPhase("off"), doneAt + 9000);
    };

    window.addEventListener(RM_EVENT, start);
    return () => {
      window.removeEventListener(RM_EVENT, start);
      clearTimers();
    };
  }, []);

  if (phase === "off") return null;

  return (
    <div
      className="absolute inset-0 z-40 px-6 sm:px-10 py-10 overflow-hidden cursor-pointer"
      style={{ background: "var(--bg)" }}
      onClick={() => setPhase("off")}
      role="alert"
      aria-label="nothing was actually deleted"
    >
      {phase === "deleting" ? (
        <div className="text-[12px] leading-[1.8]" style={{ color: "var(--soft)" }}>
          {lines.map((line, i) => (
            <div key={`${i}-${line}`}>{line}</div>
          ))}
        </div>
      ) : (
        <div className="h-full flex flex-col items-start justify-center gap-5">
          <div className="display text-[24px]" style={{ color: "var(--ink)" }}>
            what have you done.
          </div>
          {phase === "reveal" && (
            <>
              <div className="text-[13px] lowercase" style={{ color: "var(--soft)" }}>
                just kidding. backups exist.{" "}
                <span style={{ color: "var(--faint)" }}>( ˶ˆᗜˆ˵ )</span>
              </div>
              <button className="tui-btn text-[12px]" style={{ color: "var(--green)" }}>
                [restore from backup]
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
