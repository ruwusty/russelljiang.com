"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteAuth, LoginRow } from "../components/site-auth";

const SAVE_DEBOUNCE_MS = 800;

interface Dial {
  label: string;
  value: string;
}

interface Block {
  label: string;
  name?: string;
  dials?: Dial[];
  pickup?: string;
  off?: boolean;
}

interface Preset {
  num: string;
  name: string;
  desc: string;
  chain: Block[];
}

type SyncState = "idle" | "saving" | "error";

const DEFAULT_PRESETS: Preset[] = [
  {
    num: "01", name: "clean", desc: "general clean",
    chain: [
      { label: "guitar", pickup: "neck", dials: [{ label: "vol", value: "10" }, { label: "tone", value: "8" }] },
      { label: "gate", dials: [{ label: "sens", value: "20" }, { label: "decay", value: "40" }] },
      { label: "fx", name: "Rose Comp", dials: [{ label: "sens", value: "40" }, { label: "level", value: "60" }] },
      { label: "amp", name: "Jazz Clean", dials: [{ label: "gain", value: "25" }, { label: "bass", value: "50" }, { label: "mid", value: "55" }, { label: "treble", value: "60" }, { label: "master", value: "70" }] },
      { label: "ir", name: "JZ120", dials: [{ label: "level", value: "0dB" }, { label: "lo cut", value: "default" }, { label: "hi cut", value: "default" }] },
      { label: "mod", name: "CE-2", dials: [{ label: "rate", value: "30" }, { label: "depth", value: "25" }] },
      { label: "delay", off: true },
      { label: "reverb", name: "Hall", dials: [{ label: "decay", value: "30" }, { label: "level", value: "15" }, { label: "tone", value: "55" }] },
    ],
  },
  {
    num: "02", name: "clean chorus", desc: "city pop / shimmer",
    chain: [
      { label: "guitar", pickup: "both", dials: [{ label: "vol", value: "10" }, { label: "tone", value: "8" }] },
      { label: "gate", dials: [{ label: "sens", value: "20" }, { label: "decay", value: "40" }] },
      { label: "fx", name: "Rose Comp", dials: [{ label: "sens", value: "40" }, { label: "level", value: "60" }] },
      { label: "amp", name: "Deluxe Rvb", dials: [{ label: "gain", value: "20" }, { label: "bass", value: "50" }, { label: "mid", value: "50" }, { label: "treble", value: "65" }, { label: "master", value: "70" }] },
      { label: "ir", name: "DR112", dials: [{ label: "level", value: "0dB" }, { label: "lo cut", value: "default" }, { label: "hi cut", value: "default" }] },
      { label: "mod", name: "CE-1", dials: [{ label: "intensity", value: "55" }, { label: "rate", value: "35" }, { label: "depth", value: "50" }] },
      { label: "delay", off: true },
      { label: "reverb", name: "Plate", dials: [{ label: "decay", value: "35" }, { label: "level", value: "20" }, { label: "tone", value: "60" }] },
    ],
  },
  {
    num: "03", name: "kita rhythm", desc: "Morning Drv / Super Rvb",
    chain: [
      { label: "guitar", pickup: "bridge", dials: [{ label: "vol", value: "10" }, { label: "tone", value: "9" }] },
      { label: "gate", dials: [{ label: "sens", value: "33" }, { label: "decay", value: "20" }] },
      { label: "fx", name: "Morning Drv", dials: [{ label: "volume", value: "40" }, { label: "drive", value: "83" }, { label: "tone", value: "90" }] },
      { label: "amp", name: "Super Rvb", dials: [{ label: "gain", value: "59" }, { label: "bass", value: "16" }, { label: "mid", value: "28" }, { label: "treble", value: "81" }, { label: "master", value: "15" }] },
      { label: "ir", name: "DR112", dials: [{ label: "level", value: "0dB" }, { label: "lo cut", value: "default" }, { label: "hi cut", value: "default" }] },
      { label: "mod", off: true },
      { label: "delay", off: true },
      { label: "reverb", name: "Room", dials: [{ label: "decay", value: "20" }, { label: "level", value: "10" }, { label: "tone", value: "50" }] },
    ],
  },
  {
    num: "04", name: "yorushika lead", desc: "Morning Drv / Deluxe Rvb",
    chain: [
      { label: "guitar", pickup: "neck / both", dials: [{ label: "vol", value: "10" }, { label: "tone", value: "7" }] },
      { label: "gate", dials: [{ label: "sens", value: "15" }, { label: "decay", value: "45" }] },
      { label: "fx", name: "Rose Comp", dials: [{ label: "sens", value: "45" }, { label: "level", value: "60" }] },
      { label: "amp", name: "Deluxe Rvb", dials: [{ label: "gain", value: "40" }, { label: "bass", value: "45" }, { label: "mid", value: "48" }, { label: "treble", value: "58" }, { label: "master", value: "65" }] },
      { label: "ir", name: "DR112", dials: [{ label: "level", value: "0dB" }, { label: "lo cut", value: "default" }, { label: "hi cut", value: "10000hz" }] },
      { label: "mod", name: "CE-2", dials: [{ label: "rate", value: "28" }, { label: "depth", value: "30" }] },
      { label: "delay", name: "Tape Echo", dials: [{ label: "mix", value: "28" }, { label: "time", value: "38" }, { label: "fdbk", value: "30" }] },
      { label: "reverb", name: "Plate", dials: [{ label: "decay", value: "30" }, { label: "level", value: "18" }, { label: "tone", value: "52" }] },
    ],
  },
  {
    num: "05", name: "ambient", desc: "intros / floaty",
    chain: [
      { label: "guitar", pickup: "neck", dials: [{ label: "vol", value: "9" }, { label: "tone", value: "6" }] },
      { label: "gate", dials: [{ label: "sens", value: "15" }, { label: "decay", value: "60" }] },
      { label: "fx", off: true },
      { label: "amp", name: "Jazz Clean", dials: [{ label: "gain", value: "20" }, { label: "bass", value: "45" }, { label: "mid", value: "45" }, { label: "treble", value: "55" }, { label: "master", value: "65" }] },
      { label: "ir", name: "JZ120", dials: [{ label: "level", value: "0dB" }, { label: "lo cut", value: "default" }, { label: "hi cut", value: "8000hz" }] },
      { label: "mod", name: "Flanger", dials: [{ label: "level", value: "55" }, { label: "rate", value: "25" }, { label: "width", value: "40" }, { label: "f.back", value: "30" }] },
      { label: "delay", name: "Mod Delay", dials: [{ label: "time", value: "55" }, { label: "repeat", value: "50" }, { label: "mix", value: "45" }, { label: "mod", value: "30" }] },
      { label: "reverb", name: "Hall", dials: [{ label: "decay", value: "50" }, { label: "level", value: "30" }, { label: "tone", value: "55" }] },
    ],
  },
  {
    num: "06", name: "bocchi lead", desc: "Morning Drv / Brit 800",
    chain: [
      { label: "guitar", pickup: "neck", dials: [{ label: "vol", value: "10" }, { label: "tone", value: "7" }] },
      { label: "gate", dials: [{ label: "sens", value: "25" }, { label: "decay", value: "50" }] },
      { label: "fx", name: "Morning Drv", dials: [{ label: "volume", value: "40" }, { label: "drive", value: "50" }, { label: "tone", value: "72" }] },
      { label: "amp", name: "Brit 800", dials: [{ label: "gain", value: "36" }, { label: "master", value: "15" }, { label: "bass", value: "20" }, { label: "middle", value: "20" }, { label: "treble", value: "70" }, { label: "presence", value: "0" }] },
      { label: "ir", name: "M1960AV", dials: [{ label: "level", value: "0dB" }, { label: "lo cut", value: "60hz" }, { label: "hi cut", value: "9000hz" }] },
      { label: "mod", off: true },
      { label: "delay", name: "Digital", dials: [{ label: "mix", value: "25" }, { label: "time", value: "42" }, { label: "fdbk", value: "28" }] },
      { label: "reverb", name: "Room", dials: [{ label: "decay", value: "18" }, { label: "level", value: "10" }, { label: "tone", value: "48" }] },
    ],
  },
  {
    num: "07", name: "light drive", desc: "yorushika pre-chorus",
    chain: [
      { label: "guitar", pickup: "neck / both", dials: [{ label: "vol", value: "10" }, { label: "tone", value: "7" }] },
      { label: "gate", dials: [{ label: "sens", value: "15" }, { label: "decay", value: "45" }] },
      { label: "fx", name: "Morning Drv", dials: [{ label: "volume", value: "40" }, { label: "drive", value: "30" }, { label: "tone", value: "50" }] },
      { label: "amp", name: "Class A30", dials: [{ label: "gain", value: "35" }, { label: "master", value: "65" }, { label: "bass", value: "48" }, { label: "treble", value: "50" }, { label: "cut", value: "45" }] },
      { label: "ir", name: "A112", dials: [{ label: "level", value: "0dB" }, { label: "lo cut", value: "default" }, { label: "hi cut", value: "10000hz" }] },
      { label: "mod", off: true },
      { label: "delay", name: "Tape Echo", dials: [{ label: "mix", value: "22" }, { label: "time", value: "35" }, { label: "fdbk", value: "25" }] },
      { label: "reverb", name: "Hall", dials: [{ label: "decay", value: "28" }, { label: "level", value: "14" }, { label: "tone", value: "52" }] },
    ],
  },
];

function inlineInputStyle(value: string) {
  return {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--line)",
    color: "var(--ink)",
    fontFamily: "inherit",
    fontSize: "inherit",
    padding: 0,
    width: `${Math.max(value.length, 2) + 1}ch`,
  } as const;
}

interface EditCtx {
  editable: boolean;
  onEdit: (mutate: (presets: Preset[]) => Preset[]) => void;
}

function ChainBlock({
  block,
  presetIndex,
  blockIndex,
  ctx,
}: {
  block: Block;
  presetIndex: number;
  blockIndex: number;
  ctx: EditCtx;
}) {
  const setBlock = (patch: Partial<Block>) =>
    ctx.onEdit((presets) =>
      presets.map((p, pi) =>
        pi !== presetIndex
          ? p
          : {
              ...p,
              chain: p.chain.map((b, bi) => (bi !== blockIndex ? b : { ...b, ...patch })),
            }
      )
    );

  const setDial = (dialIndex: number, value: string) =>
    ctx.onEdit((presets) =>
      presets.map((p, pi) =>
        pi !== presetIndex
          ? p
          : {
              ...p,
              chain: p.chain.map((b, bi) =>
                bi !== blockIndex
                  ? b
                  : {
                      ...b,
                      dials: b.dials?.map((d, di) =>
                        di !== dialIndex ? d : { ...d, value }
                      ),
                    }
              ),
            }
      )
    );

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "60px 1fr", alignItems: "start" }}>
      <span className="text-[10px] lowercase tracking-[0.1em] pt-0.5" style={{ color: "var(--faint)" }}>
        {block.label}
      </span>
      <div className={block.pickup ? "flex items-baseline flex-wrap gap-x-2.5 gap-y-0.5" : "flex flex-col gap-0.5"}>
        {block.off ? (
          <span className="text-[11px]" style={{ color: "var(--faint)" }}>
            off
          </span>
        ) : (
          <>
            {block.pickup !== undefined &&
              (ctx.editable ? (
                <span className="text-[11px] lowercase" style={{ color: "var(--accent)" }}>
                  [
                  <input
                    value={block.pickup}
                    onChange={(e) => setBlock({ pickup: e.target.value })}
                    className="outline-none text-[11px]"
                    style={{ ...inlineInputStyle(block.pickup), color: "var(--accent)" }}
                    aria-label={`${block.label} pickup`}
                  />
                  ]
                </span>
              ) : (
                <span className="text-[11px] lowercase" style={{ color: "var(--accent)" }}>
                  [{block.pickup}]
                </span>
              ))}
            {block.name !== undefined &&
              (ctx.editable ? (
                <input
                  value={block.name}
                  onChange={(e) => setBlock({ name: e.target.value })}
                  className="outline-none text-[11px]"
                  style={inlineInputStyle(block.name)}
                  aria-label={`${block.label} name`}
                />
              ) : (
                <span className="text-[11px]" style={{ color: "var(--ink)" }}>
                  {block.name}
                </span>
              ))}
            {block.dials && (
              <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                {block.dials.map((d, di) => (
                  <span key={d.label} className="text-[11px]" style={{ color: "var(--soft)" }}>
                    {d.label}{" "}
                    {ctx.editable ? (
                      <input
                        value={d.value}
                        onChange={(e) => setDial(di, e.target.value)}
                        className="outline-none text-[11px]"
                        style={inlineInputStyle(d.value)}
                        aria-label={`${block.label} ${d.label}`}
                      />
                    ) : (
                      <span style={{ color: "var(--ink)" }}>{d.value}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  presetIndex,
  ctx,
}: {
  preset: Preset;
  presetIndex: number;
  ctx: EditCtx;
}) {
  const setDesc = (desc: string) =>
    ctx.onEdit((presets) =>
      presets.map((p, pi) => (pi !== presetIndex ? p : { ...p, desc }))
    );

  return (
    <section id={`preset-${preset.num.replace(/^0/, "")}`} className="mt-12 first:mt-0">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px]" style={{ color: "var(--faint)" }}>
          {preset.num}
        </span>
        <h2 className="text-[13px] lowercase tracking-[0.15em]" style={{ color: "var(--ink)" }}>
          {preset.name}
        </h2>
        {ctx.editable ? (
          <input
            value={preset.desc}
            onChange={(e) => setDesc(e.target.value)}
            className="outline-none text-[11px] lowercase ml-auto text-right"
            style={{ ...inlineInputStyle(preset.desc), color: "var(--soft)" }}
            aria-label={`${preset.name} description`}
          />
        ) : (
          <span className="text-[11px] lowercase ml-auto" style={{ color: "var(--soft)" }}>
            {preset.desc}
          </span>
        )}
      </div>
      <div
        className="mt-3 pl-4 flex flex-col gap-1.5"
        style={{ borderLeft: "1px solid var(--line)" }}
      >
        {preset.chain.map((block, bi) => (
          <ChainBlock
            key={block.label}
            block={block}
            presetIndex={presetIndex}
            blockIndex={bi}
            ctx={ctx}
          />
        ))}
      </div>
    </section>
  );
}

export function PresetsGrid() {
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [mounted, setMounted] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const { password, ready: authReady, login, logout, dropSession } = useSiteAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordRef = useRef<string | null>(null);
  passwordRef.current = password;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/presets", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && Array.isArray(json.presets)) setPresets(json.presets);
      } catch {}
      if (!cancelled) setMounted(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushToServer = useCallback(
    (next: Preset[]) => {
      const pw = passwordRef.current;
      if (!pw) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSyncState("saving");
      saveTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/presets", {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              "x-site-password": pw,
            },
            body: JSON.stringify(next),
          });
          if (res.status === 401) {
            dropSession();
            setSyncState("idle");
            return;
          }
          setSyncState(res.ok ? "idle" : "error");
        } catch {
          setSyncState("error");
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [dropSession]
  );

  const onEdit = useCallback(
    (mutate: (presets: Preset[]) => Preset[]) => {
      setPresets((current) => {
        const next = mutate(current);
        pushToServer(next);
        return next;
      });
    },
    [pushToServer]
  );

  const ctx: EditCtx = { editable: Boolean(password), onEdit };

  return (
    <div>
      {/* auth + sync row */}
      <div className="flex items-baseline gap-3 flex-wrap text-[12px]" style={{ color: "var(--soft)" }}>
        {password ? (
          <button onClick={logout} className="tui-btn text-[12px]">
            [logout]
          </button>
        ) : (
          <button
            onClick={() => setLoginOpen((v) => !v)}
            className="tui-btn text-[12px]"
            style={{ color: "var(--green)" }}
          >
            [login]
          </button>
        )}
        <span
          className="ml-auto lowercase text-[11px]"
          style={{ color: syncState === "error" ? "var(--accent)" : "var(--faint)" }}
          aria-live="polite"
        >
          {!mounted || !authReady
            ? "loading…"
            : syncState === "saving"
              ? "saving…"
              : syncState === "error"
                ? "save failed — retrying on next change"
                : password
                  ? "editing live — changes sync"
                  : "log in to edit"}
        </span>
      </div>

      {loginOpen && !password && (
        <LoginRow login={login} onClose={() => setLoginOpen(false)} />
      )}

      <div className="mt-10">
        {presets.map((preset, pi) => (
          <PresetCard key={preset.num} preset={preset} presetIndex={pi} ctx={ctx} />
        ))}
      </div>
    </div>
  );
}
