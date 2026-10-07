"use client";

import { type LogoName } from "../lib/fetch-logos";
import { FetchArt } from "./fetch-art";

// what `fastfetch` prints under the prompt. the home hero is the about-me
// fetch; this one reports on the machine you are reading from, the way the
// real thing does. a snapshot: computed once when the command runs, never
// ticks. client-only (it only exists after a command), so nothing here has
// to match the server.

function osName(ua: string): string {
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Mac OS X/.test(ua)) return "macos";
  if (/Windows/.test(ua)) return "windows";
  if (/CrOS/.test(ua)) return "chromeos";
  if (/Linux/.test(ua)) return "linux";
  return "unknown";
}

function browserName(ua: string): string {
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Chrome\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua)) return "safari";
  return "a browser";
}

function uptime(): string {
  const s = Math.max(0, Math.round(performance.now() / 1000));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

const SWATCHES = ["--ink", "--soft", "--faint", "--line", "--accent", "--rose"];

export function FetchOutput({
  logo,
  user,
  theme,
  pages,
  essays,
}: {
  logo: LogoName;
  user: string;
  theme: string;
  pages: number;
  essays: number;
}) {
  const ua = navigator.userAgent;
  const dpr = window.devicePixelRatio;
  const clock = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  const rows: [string, string][] = [
    ["os", osName(ua)],
    ["host", "russelljiang.com"],
    ["kernel", "next.js 15 · react 19"],
    ["uptime", uptime()],
    ["packages", `${pages} pages · ${essays} essays`],
    ["shell", "ru.sh"],
    ["terminal", browserName(ua)],
    ["display", `${window.innerWidth}×${window.innerHeight}${dpr > 1 ? ` @${dpr}x` : ""}`],
    ["theme", `wisteria (${theme})`],
    ["font", "maple mono"],
    ["offset", "+0ms (calibrated)"],
    ["locale", `${navigator.language.toLowerCase()} · syd ${clock}`],
  ];

  return (
    <div className="mt-2 mb-1 flex flex-col gap-4 sm:flex-row sm:gap-8 normal-case">
      <FetchArt name={logo} className="m-0 pt-0.5 shrink-0 self-start" style={{ fontSize: 10 }} />
      <div className="min-w-0 text-[12px] leading-[1.6] lowercase">
        <div>
          <span style={{ color: "var(--accent)" }}>{user}</span>
          <span style={{ color: "var(--soft)" }}>@</span>
          <span style={{ color: "var(--accent)" }}>russelljiang.com</span>
        </div>
        <div style={{ color: "var(--faint)" }} aria-hidden="true">
          {"─".repeat(user.length + 17)}
        </div>
        <dl className="m-0 grid grid-cols-[9ch_minmax(0,1fr)] gap-x-2">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt style={{ color: "var(--accent)" }}>{k}</dt>
              <dd className="m-0 truncate" style={{ color: "var(--ink)" }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-2 flex" aria-hidden="true">
          {SWATCHES.map((v) => (
            <span key={v} className="swatch" style={{ background: `var(${v})` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
