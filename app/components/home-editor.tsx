"use client";

import { useState } from "react";
import { Kaomoji } from "./kaomoji";
import { useSiteAuth } from "./site-auth";
import type { HomeContent } from "../lib/home-content";

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

export function HomeEditor({ initial }: { initial: HomeContent }) {
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
          style={{ color: "var(--faint)" }}
        >
          <button onClick={save} className="tui-btn text-[11px]" style={{ color: "var(--green)" }}>
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
      {editing === "bio" ? (
        editor("bio", 6)
      ) : (
        <p className="text-[14px] leading-[1.9]" style={{ color: "var(--soft)" }}>
          {content.bio}
          {editButton("bio")}
        </p>
      )}

      <aside
        className="mt-8 pl-4 text-[12px] leading-[1.9] lowercase"
        style={{ borderLeft: "1px solid var(--line)", color: "var(--soft)" }}
      >
        <span style={{ color: "var(--green)" }}>note</span> — this site is a work
        in progress. check back occasionally — or don&apos;t.{" "}
        <Kaomoji slot="home-note" fallback="(￣ー￣)ゞ" className="text-[12px]" />
      </aside>

      <h2
        id="background"
        className="mt-16 text-[13px] lowercase tracking-[0.15em]"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--faint)" }}>01</span> background
        {editButton("background")}
      </h2>
      {editing === "background" ? (
        editor("background", 6)
      ) : (
        <dl
          className="mt-4 text-[14px] grid grid-cols-[140px_1fr] gap-y-1"
          style={{ color: "var(--soft)" }}
        >
          {content.background.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-[12px]" style={{ color: "var(--faint)" }}>
                {row.label}
              </dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <h2
        id="interests"
        className="mt-16 text-[13px] lowercase tracking-[0.15em]"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--faint)" }}>02</span> interests
        {editButton("interests")}
      </h2>
      {editing === "interests" ? (
        editor("interests", 13)
      ) : (
        <ul className="mt-4 text-[14px] space-y-1 list-none p-0" style={{ color: "var(--soft)" }}>
          {content.interests.map((line) => (
            <li key={line} className="flex items-baseline gap-3">
              <span style={{ color: "var(--faint)" }}>▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
