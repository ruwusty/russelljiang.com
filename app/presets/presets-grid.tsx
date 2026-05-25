const mono = "ui-monospace, SFMono-Regular, 'IBM Plex Mono', Menlo, monospace";

type PresetColor = "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7";

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
  color: PresetColor;
  chain: Block[];
}

const COLORS: Record<PresetColor, string> = {
  c1: "#60f090",
  c2: "#f0e060",
  c3: "#f06060",
  c4: "#6090f0",
  c5: "#50e0e0",
  c6: "#f060b0",
  c7: "#e8e8ea",
};

const PRESETS: Preset[] = [
  {
    num: "01", name: "clean", desc: "general clean", color: "c1",
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
    num: "02", name: "clean chorus", desc: "city pop / shimmer", color: "c2",
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
    num: "03", name: "kita rhythm", desc: "Morning Drv / Super Rvb", color: "c3",
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
    num: "04", name: "yorushika lead", desc: "Morning Drv / Deluxe Rvb", color: "c4",
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
    num: "05", name: "ambient", desc: "intros / floaty", color: "c5",
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
    num: "06", name: "bocchi lead", desc: "Morning Drv / Brit 800", color: "c6",
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
    num: "07", name: "light drive", desc: "yorushika pre-chorus", color: "c7",
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

function PickupBadge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-block rounded-sm text-[9px] px-1.5 py-0.5 uppercase tracking-wide"
      style={{
        fontFamily: mono,
        background: `${color}15`,
        border: `1px solid ${color}4d`,
        color,
      }}
    >
      {text}
    </span>
  );
}

function ChainBlock({ block, color }: { block: Block; color: string }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "60px 1fr", alignItems: "start" }}>
      <span
        className="text-[9px] font-medium uppercase tracking-wider pt-0.5"
        style={{ fontFamily: mono, color: "var(--muted)" }}
      >
        {block.label}
      </span>
      <div className={block.pickup ? "flex items-center flex-wrap gap-1.5" : "flex flex-col gap-0.5"}>
        {block.off ? (
          <span className="text-[11px] italic" style={{ color: "var(--border)" }}>off</span>
        ) : (
          <>
            {block.pickup && <PickupBadge text={block.pickup} color={color} />}
            {block.name && (
              <span className="text-[11px] font-medium" style={{ fontFamily: mono, color: "var(--text)" }}>
                {block.name}
              </span>
            )}
            {block.dials && (
              <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                {block.dials.map((d) => (
                  <span key={d.label} className="text-[11px]" style={{ color: "var(--muted)" }}>
                    {d.label}{" "}
                    <span className="font-medium" style={{ color: "var(--text)" }}>{d.value}</span>
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

function PresetCard({ preset }: { preset: Preset }) {
  const color = COLORS[preset.color];
  return (
    <div
      id={`preset-${preset.num.replace(/^0/, "")}`}
      className="p-4 sm:p-5"
      style={{
        background: "var(--bg)",
        borderTop: `2px solid ${color}`,
        border: "1px solid var(--border)",
        borderTopColor: color,
        borderRadius: "8px",
      }}
    >
      <div
        className="flex items-baseline gap-3 mb-3 pb-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-[10px]" style={{ fontFamily: mono, color: "var(--muted)" }}>
          {preset.num}
        </span>
        <span className="text-[13px] font-semibold tracking-wide" style={{ fontFamily: mono, color }}>
          {preset.name}
        </span>
        <span className="text-[11px] italic ml-auto" style={{ color: "var(--muted)" }}>
          {preset.desc}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {preset.chain.map((block) => (
          <ChainBlock key={block.label} block={block} color={color} />
        ))}
      </div>
    </div>
  );
}

export function PresetsGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {PRESETS.map((preset) => (
        <PresetCard key={preset.num} preset={preset} />
      ))}
    </div>
  );
}
