// One-shot: rewrite in-repo fallback defaults to match the current blob content
// (reads from backups/*.json produced by backup-blobs.mjs).
import { readFileSync, writeFileSync } from "fs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));

function replaceBlock(file, startMarker, replacement, data) {
  if (data === null || data === undefined) {
    console.log(`${file} skipped — nothing stored in blob, file defaults remain the truth`);
    return;
  }
  const src = readFileSync(file, "utf8");
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error(`marker not found in ${file}`);
  const end = src.indexOf("\n];", start);
  if (end === -1) throw new Error(`end not found in ${file}`);
  const next = src.slice(0, start) + replacement + src.slice(end + 3);
  writeFileSync(file, next);
  console.log(`${file} synced`);
}

const indent = (json) => json.split("\n").join("\n");

const currently = read("backups/currently.json").items;
replaceBlock(
  "app/components/currently.tsx",
  "const DEFAULT_ITEMS = [",
  `const DEFAULT_ITEMS = ${indent(JSON.stringify(currently, null, 2))};`,
  currently
);

const plan = read("backups/plan.json").courses;
replaceBlock(
  "app/plan/planner.tsx",
  "const DEFAULT_COURSES: Course[] = [",
  `const DEFAULT_COURSES: Course[] = ${indent(JSON.stringify(plan, null, 2))};`,
  plan
);

const presets = read("backups/presets.json").presets;
replaceBlock(
  "app/presets/presets-grid.tsx",
  "const DEFAULT_PRESETS: Preset[] = [",
  `const DEFAULT_PRESETS: Preset[] = ${indent(JSON.stringify(presets, null, 2))};`,
  presets
);
