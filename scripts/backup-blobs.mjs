// Backs up all blob-stored site content to backups/*.json via the public API
// (sanitised — no ip hashes). Usage:
//   node scripts/backup-blobs.mjs            # against http://localhost:3000
//   node scripts/backup-blobs.mjs https://russelljiang.com
import { mkdirSync, writeFileSync } from "fs";

const base = process.argv[2] ?? "http://localhost:3000";

const ENDPOINTS = [
  ["home", "/api/home"],
  ["currently", "/api/currently"],
  ["kaomoji", "/api/kaomoji"],
  ["plan", "/api/plan"],
  ["presets", "/api/presets"],
  ["guestbook", "/api/guestbook"],
  ["vim-leaderboard", "/api/vim-scores"],
];

mkdirSync("backups", { recursive: true });

let failures = 0;
for (const [name, path] of ENDPOINTS) {
  try {
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    writeFileSync(`backups/${name}.json`, JSON.stringify(data, null, 2) + "\n");
    console.log(`backups/${name}.json ok`);
  } catch (error) {
    failures++;
    console.error(`backups/${name}.json FAILED: ${error.message}`);
  }
}

writeFileSync(
  "backups/README.md",
  `# blob backups\n\nsanitised JSON exports of the site's Vercel Blob content, taken via the public API.\nregenerate with \`node scripts/backup-blobs.mjs [base-url]\`.\nnote: vim-leaderboard only contains the top 10 per difficulty (the api view).\n\nlast run: ${new Date().toISOString()}\n`
);

process.exit(failures > 0 ? 1 : 0);
