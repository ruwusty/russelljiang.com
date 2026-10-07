import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// node, not edge: with maple bundled in, an edge function is over vercel's
// 1 mb cap. nothing here is dynamic, so next renders the png once at build.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "russell jiang — a terminal you can read in a browser";

// the link preview is the site in miniature: a dark window, the mark, and a
// fetch beside it. maple mono sits next to this file (satori reads woff, not
// woff2) and is read from disk, so the card never depends on a network
// fetch. only characters maple has go in here: satori draws anything
// missing as tofu.
const font = (name: string) => readFile(join(process.cwd(), "app", name));

const C = {
  bg: "#1a1a1e",
  ink: "#dcddde",
  soft: "#9a9aa3",
  faint: "#555560",
  line: "#2e2e34",
  accent: "#a28fc0",
  rose: "#e0a8b0",
};

// the mark: one swappable piece, the same drawing as app/icon.svg
function Mark({ px }: { px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.08" stopColor="#7a6488" />
          <stop offset="0.95" stopColor="#a35d6d" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g)" />
      <path d="M33 78 L49 30" fill="none" stroke="#f7f7f8" strokeWidth="10" strokeLinecap="round" />
      <path
        d="M44 46 C 52 34, 62 30, 74 33"
        fill="none"
        stroke="#f7f7f8"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function OpengraphImage() {
  const [regular, italic] = await Promise.all([
    font("og-maple-400.woff"),
    font("og-maple-400-italic.woff"),
  ]);

  const rows: [string, string][] = [
    ["degree", "data science & decisions @ unsw"],
    ["shell", "ru.sh"],
    ["theme", "wisteria"],
    ["site", "russelljiang.com"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#111114",
          padding: 40,
          fontFamily: "Maple Mono",
          color: C.ink,
        }}
      >
        {/* the window */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: C.bg,
            border: `2px solid ${C.line}`,
            borderRadius: 20,
          }}
        >
          {/* title bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 30px",
              borderBottom: `2px solid ${C.line}`,
              fontSize: 24,
            }}
          >
            <span>russell jiang</span>
            <span style={{ color: C.soft }}>[light]</span>
          </div>

          {/* the fetch */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 64px", gap: 60 }}>
            <Mark px={250} />
            <div style={{ display: "flex", flexDirection: "column", fontSize: 26 }}>
              <div style={{ display: "flex", color: C.soft }}>
                <span style={{ color: C.rose, marginRight: 14 }}>❯</span>
                fastfetch
              </div>
              <div style={{ display: "flex", marginTop: 18, fontSize: 52 }}>
                <span style={{ color: C.accent, marginRight: 22 }}>#</span>
                russell jiang
              </div>
              <div style={{ display: "flex", marginTop: 6, color: C.soft, fontStyle: "italic" }}>
                a terminal you can read in a browser
              </div>
              <div style={{ display: "flex", width: 560, height: 2, background: C.line, margin: "22px 0 16px" }} />
              {rows.map(([k, v]) => (
                <div key={k} style={{ display: "flex", marginTop: 4 }}>
                  <span style={{ width: 130, color: C.accent }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* status bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `2px solid ${C.line}`,
              padding: "12px 20px",
              fontSize: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ background: C.rose, color: C.bg, padding: "2px 16px" }}>normal</span>
              <span style={{ background: C.line, color: C.ink, padding: "2px 16px" }}>~/overview</span>
              <span style={{ color: C.faint, marginLeft: 20 }}>: cmd · / grep · tab complete</span>
            </div>
            <span style={{ background: C.accent, color: C.bg, padding: "2px 16px" }}>all</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Maple Mono", data: regular, weight: 400, style: "normal" },
        { name: "Maple Mono", data: italic, weight: 400, style: "italic" },
      ],
    }
  );
}
