export interface BackgroundRow {
  label: string;
  value: string;
}

export interface HomeContent {
  bio: string;
  background: BackgroundRow[];
  interests: string[];
}

export const DEFAULT_HOME: HomeContent = {
  bio: "first-year data science student at UNSW Sydney, working somewhere in the overlap of statistics, computing, and decision-making. i tutor students across STEM and beyond, turning exam panic into working method. away from the screen i'm a clarinettist and saxophonist, and a guitarist on a good day.",
  background: [
    { label: "degree", value: "B. Data Science & Decisions @ UNSW · year 1 of 3" },
    { label: "editor", value: "VS Code, with recurring nvim ambitions" },
    { label: "instruments", value: "clarinet · tenor sax · telecaster" },
    { label: "on repeat", value: "yorushika · jpop/jrock that survives the practice room" },
  ],
  interests: [
    "causal inference, and models that can explain themselves",
    "game theory, and the equilibria people actually play",
    "teaching as debugging: finding the exact line where understanding diverges",
    "how good typography quietly does half the work",
    "small, sharp CLI tools and whatever's in people's dotfiles",
    "interfaces that load instantly and never animate without a reason",
    "keyboards with the right amount of click",
    "chamber music — where no one's hiding in the back row",
    "transcribing things by ear that have perfectly good sheet music",
    "notebooks, note-taking systems, and the graphs that form between ideas",
    "training like this site is designed: high intensity, low volume, nothing wasted",
    "a properly constructed bowl of pho",
  ],
};

export function isValidHomeContent(value: unknown): value is HomeContent {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (typeof o.bio !== "string" || o.bio.length === 0 || o.bio.length > 2000) return false;
  if (
    !Array.isArray(o.background) ||
    o.background.length > 12 ||
    !o.background.every((row) => {
      if (typeof row !== "object" || row === null) return false;
      const r = row as Record<string, unknown>;
      return (
        typeof r.label === "string" &&
        r.label.length > 0 &&
        r.label.length <= 40 &&
        typeof r.value === "string" &&
        r.value.length <= 160
      );
    })
  ) {
    return false;
  }
  if (
    !Array.isArray(o.interests) ||
    o.interests.length > 20 ||
    !o.interests.every(
      (item) => typeof item === "string" && item.length > 0 && item.length <= 200
    )
  ) {
    return false;
  }
  return true;
}
