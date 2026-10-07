"use client";

import { useState } from "react";
import { Kaomoji } from "./kaomoji";
import { useSiteAuth } from "./site-auth";
import type { HomeContent } from "../lib/home-content";
import { type LogoName } from "../lib/fetch-logos";
import { FetchArt } from "./fetch-art";

type Section = "bio" | "background" | "interests";
type SaveState = "idle" | "saving" | "error";

const textareaStyle = {
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink)",
  fontFamily: "inherit",
} as const;

const SECTION_HINT: Record<Section, string> = {
  bio: "plain text",
  background: "one row per line, as label: value",
  interests: "one interest per line",
};

// neofetch ends on the terminal's colour row; this one ends on the palette
const SWATCHES = ["--ink", "--soft", "--faint", "--line", "--accent", "--rose"];

export function HomeEditor({
  initial,
  heading,
  logo,
}: {
  initial: HomeContent;
  heading: React.ReactNode;
  /** picked per request by the page, so ssr and hydration agree */
  logo: LogoName;
}) {
  const { password } = useSiteAuth();
  const [content, setContent] = useState(initial);
  const [editing, setEditing] = useState<Section | null>(null);
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const openEdit = (section: Section) => {
    setDraft(
      section === "bio"
        ? content.bio
        : section === "background"
          ? content.background.map((r) => `${r.label}: ${r.value}`).join("\n")
          : content.interests.join("\n")
    );
    setSaveState("idle");
    setEditing(section);
  };

  const save = async () => {
    if (!password || !editing || saveState === "saving") return;

    let next: HomeContent;
    if (editing === "bio") {
      const bio = draft.trim();
      if (!bio) return;
      next = { ...content, bio };
    } else if (editing === "background") {
      const background = draft
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const i = line.indexOf(":");
          return i === -1
            ? { label: line.slice(0, 40), value: "" }
            : {
                label: line.slice(0, i).trim().slice(0, 40),
                value: line.slice(i + 1).trim().slice(0, 160),
              };
        })
        .filter((row) => row.label);
      if (background.length === 0) return;
      next = { ...content, background };
    } else {
      const interests = draft
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.slice(0, 200));
      if (interests.length === 0) return;
      next = { ...content, interests };
    }

    setSaveState("saving");
    try {
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-site-password": password,
        },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      setContent(next);
      setEditing(null);
      setSaveState("idle");
    } catch {
      setSaveState("error");
    }
  };

  const editButton = (section: Section) =>
    password && editing !== section ? (
      <button onClick={() => openEdit(section)} className="tui-btn text-[11px] ml-2">
        [edit]
      </button>
    ) : null;

  const editor = (section: Section, rows: number) =>
    editing === section ? (
      <div className="mt-3 flex flex-col gap-1.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={rows}
          spellCheck={false}
          className="w-full px-2 py-1.5 text-[12px] leading-[1.7] outline-none resize-y"
          style={textareaStyle}
          aria-label={`edit ${section}`}
        />
        <span
          className="flex items-baseline gap-3 text-[11px] lowercase"
          style={{ color: "var(--soft)" }}
        >
          <button onClick={save} className="tui-btn text-[11px]" style={{ color: "var(--rose)" }}>
            {saveState === "saving" ? "[saving…]" : "[save]"}
          </button>
          <button onClick={() => setEditing(null)} className="tui-btn text-[11px]">
            [cancel]
          </button>
          <span>{SECTION_HINT[section]}</span>
          {saveState === "error" && <span style={{ color: "var(--accent)" }}>save failed</span>}
        </span>
      </div>
    ) : null;

  return (
    <>
      {/* neofetch: logo left, who-am-i right */}
      <section
        id="introduction"
        className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10"
      >
        <FetchArt name={logo} className="m-0 pt-1" />
        <div className="min-w-0 flex-1">
          {heading}
          <div
            className="mt-3 mb-3 text-[12px] leading-none select-none overflow-hidden whitespace-nowrap"
            style={{ color: "var(--faint)" }}
            aria-hidden="true"
          >
            {"─".repeat(48)}
          </div>
          <div id="background">
            {editing === "background" ? (
              editor("background", 6)
            ) : (
              <dl className="m-0 text-[13px] grid grid-cols-1 gap-x-3 sm:grid-cols-[minmax(0,112px)_1fr] sm:gap-y-0.5">
                {content.background.map((row) => (
                  <div key={row.label} className="contents">
                    <dt className="truncate" style={{ color: "var(--accent)" }}>
                      {row.label}
                    </dt>
                    <dd className="m-0 mb-2 sm:mb-0" style={{ color: "var(--ink)" }}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-4 flex items-center gap-0" aria-hidden="true">
              {SWATCHES.map((v) => (
                <span key={v} className="swatch" style={{ background: `var(${v})` }} />
              ))}
              {editButton("background")}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12">
        {editing === "bio" ? (
          editor("bio", 6)
        ) : (
          <p className="text-[14px] leading-[1.85]" style={{ color: "var(--ink)" }}>
            {content.bio}
            {editButton("bio")}
          </p>
        )}
      </div>

      <aside
        className="comment mt-8 pl-4 text-[12px] leading-[1.9] lowercase"
        style={{ borderLeft: "2px solid var(--rose)", color: "var(--soft)" }}
      >
        <span style={{ color: "var(--rose)" }}>note</span> — this site is a work
        in progress. check back occasionally — or don&apos;t.{" "}
        <Kaomoji slot="home-note" fallback="¯\_(ツ)_/¯" className="text-[12px]" />
      </aside>

      <h2
        id="interests"
        className="mt-14 text-[13px] lowercase tracking-[0.15em]"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--accent)" }}>##</span> interests
        {editButton("interests")}
      </h2>
      {editing === "interests" ? (
        editor("interests", 13)
      ) : (
        <ul className="mt-4 text-[14px] leading-[1.55] list-none p-0" style={{ color: "var(--ink)" }}>
          {/* `tree`, not bullets */}
          {content.interests.map((line, i) => (
            <li key={line} className="flex items-baseline gap-2">
              <span className="shrink-0" style={{ color: "var(--faint)" }} aria-hidden="true">
                {i === content.interests.length - 1 ? "└──" : "├──"}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
