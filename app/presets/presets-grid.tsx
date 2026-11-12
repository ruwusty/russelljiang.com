"use client";

// first-run seed and outage fallback only: the blob is the source of truth.
// backups/ is refreshed weekly from the live site, so this never needs editing.
import backup from "@/backups/presets.json";
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

// the amp's slot leds, fixed in hardware: they belong to the slot number,
// not to whatever preset is saved there. a sanctioned exception to the
// palette — these mirror physical lights, so they have to be recognisable.
const SLOT_LED: Record<string, { name: string; color: string }> = {
  "01": { name: "lime green", color: "#9bc53d" },
  "02": { name: "orange", color: "#e0893a" },
  "03": { name: "red", color: "#cf4f3f" },
  "04": { name: "blue", color: "#4a7cc2" },
  "05": { name: "cyan", color: "#3db3c2" },
  "06": { name: "pink", color: "#e07fae" },
  "07": { name: "white", color: "#ffffff" },
};

const DEFAULT_PRESETS = backup.presets as Preset[];

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
      <span className="text-[10px] lowercase tracking-[0.1em] pt-0.5" style={{ color: "var(--soft)" }}>
        {block.label}
      </span>
      <div className={block.pickup ? "flex items-baseline flex-wrap gap-x-2.5 gap-y-0.5" : "flex flex-col gap-0.5"}>
        {block.off ? (
          <span className="text-[11px]" style={{ color: "var(--soft)" }}>
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

  const led = SLOT_LED[preset.num];

  return (
    <section id={`preset-${preset.num.replace(/^0/, "")}`} className="mt-12 first:mt-0">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] flex items-baseline gap-1.5" style={{ color: "var(--faint)" }}>
          {led && (
            <span
              className="inline-block w-[7px] h-[7px] self-center"
              style={{
                background: led.color,
                border: led.name === "white" ? "1px solid var(--soft)" : "none",
              }}
              title={`slot led: ${led.name}`}
              aria-label={`slot led: ${led.name}`}
              role="img"
            />
          )}
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
            style={{ color: "var(--rose)" }}
          >
            [login]
          </button>
        )}
        <span
          className="ml-auto lowercase text-[11px]"
          style={{ color: syncState === "error" ? "var(--accent)" : "var(--soft)" }}
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
