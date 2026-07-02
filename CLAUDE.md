# russelljiang.com — conventions

personal site for Russell Jiang. tui × japanese minimal aesthetic. read this
before changing anything visual or touching content.

## design rules (hard)

- palette via css vars in `app/globals.css` only: `--bg #faf8f3` (paper),
  `--ink`, `--soft`, `--faint`, `--line`, `--accent #9a6a4f` (clay, hover/links
  only), `--green #6f8f6a` (prompts, sparingly). dark mode inverts to `#16140f`
  warm near-black, same accent. NO other colours (curated exceptions: guestbook
  name palette in `app/guestbook/guestbook.tsx`).
- no drop shadows, no border-radius, no gradients, no bold weights in body
  text, no images as decoration (content images in /writing are fine).
- type: JetBrains Mono everywhere; `.display` class (mincho serif, 0.2em
  tracking, weight 400) for the site title and page h1s ONLY. body 14px,
  line-height 1.9; small text 11–12px. lowercase except where grammar demands.
- layout: single column inside the bordered "terminal pane" in
  `app/components/docs-shell.tsx`. 1px solid borders only, used sparingly.
  a 44px × 1px `.hrule` under each page heading. generous whitespace.
- animations: ONLY the blinking cursor (`.cursor-block`), the currently
  typewriter, and the library spine hover-lift (`.spine`); everything else is
  instant colour changes. always respect `prefers-reduced-motion`.
- kaomoji appear only through the `<Kaomoji>` slot component
  (`app/components/kaomoji.tsx`) — never hardcode new ones into pages.

## architecture

- next.js 15 app router, tailwind v3, no ui libraries.
- editable content lives in vercel blob, one json blob per feature, behind
  api routes in `app/api/*`: public GET, password-gated PUT via
  `x-site-password` header → `passwordOk()` in `app/api/_lib/auth.ts`
  (timing-safe, env `SITE_PASSWORD`).
- client auth = `useSiteAuth()` in `app/components/site-auth.tsx`
  (sessionStorage `site_pw`, broadcasts changes via window event so all
  components unlock together). one password for everything.
- **the blob is the source of truth.** hardcoded defaults in components
  (DEFAULT_ITEMS, DEFAULT_HOME, DEFAULT_COURSES, DEFAULT_PRESETS,
  DEFAULT_BOOKS) are
  first-run seeds and outage fallbacks only — to change live content, edit
  on the site while logged in, or PUT to the api. do not edit the defaults
  expecting the site to change.
- exception: the home page (`app/page.tsx`) reads its blob server-side
  (force-dynamic) so bio/background/interests stay in the SSR html for seo.
  keep it that way.
- public-write endpoints (guestbook, vim-scores) have honeypots, per-ip
  cooldowns (hashed ips, never raw), length caps, validation. keep all of
  these when touching them.
- daily digest: `app/lib/digest.ts` fetches ~16 rss/atom/hn sources (ai labs,
  eng/ml blogs, capped arxiv, aggregators), dedups,
  caps, then calls the gemini api (`gemini-3.5-flash` free tier, structured
  json output) to pick ~12 items — swapping providers is localized to the
  `curate()` function. cron `app/api/cron/digest` runs `0 20 * * *` (6–7am
  sydney, dst-safe) protected by `CRON_SECRET`; manual run via POST
  `app/api/cron/digest/trigger` with `x-trigger-secret` (env
  `DIGEST_TRIGGER_SECRET`) or the owner-only [refresh] button (site password).
  output stored in blob `digest/latest.json` + dated archive; `/digest` reads
  it. env `GEMINI_API_KEY` required (`GEMINI_MODEL` optional override).

## routes

public: `/` `/writing` `/writing/vibe-coding-wont-save-you`
`/writing/the-same-shape-everywhere` `/digest` `/library` `/guestbook` `/vim`
`/bonsai` `/projects`. unlisted + noindex: `/plan` `/presets`, `/stats`
(`:stats`), `/404` (the tamagotchi cat), and gated drafts under `/writing/*`.
nav lives in
`app/components/sidebar.tsx` (j/k + enter navigation); command mode in
`app/components/command-bar.tsx` (`:` key) — new pages should be added to
both, plus the `:help` page list.

## writing

new essays use the mdx pipeline — **read `docs/WRITING.md`** for the two-file
pattern (`content.mdx` + `page.tsx` with `EssayLayout`), the wiring checklist
(index, sitemap, CLAUDE.md), and the voice/typography rules. the two oldest
essays are hand-rolled jsx; leave them.

## scripts

- `node scripts/backup-blobs.mjs [base-url]` — snapshot all blob content to
  `backups/` (sanitised, via public api). run occasionally, commit the diff.
- `node scripts/sync-defaults.mjs` — rewrite in-repo fallback defaults from
  `backups/` (skips blobs that don't exist yet).

## workflow

- `npx tsc --noEmit` before every commit. conventional commits
  (`feat:`/`fix:`/`docs:`/`refactor:`), no attribution lines.
- push straight to master; vercel auto-deploys production. previews are
  unused. env vars (`SITE_PASSWORD`, `BLOB_READ_WRITE_TOKEN`) live in vercel;
  local copies in gitignored `.env.local` (dev password: `changeme`).
- `npm run build` while `npm run dev` is running corrupts `.next` — restart
  the dev server after building.
- the repo is PUBLIC. never commit secrets, raw ips, or anything from
  `.env.local`; backups must come from the public api (sanitised), not raw
  blob reads.

## voice

lowercase, dry, terminal-flavoured. kaomoji budget: at most one per section,
restraint is the point. when writing copy, fewer words and no corporate tone.
russell co-writes essays with credited co-authors; don't call the tutoring
platform anything other than "sydney scholars".

humour is part of the design system — russell explicitly wants it. puns and
easter eggs in the house style are encouraged: `❯ cat ./this-page` finding an
actual cat on the 404, `:q` → "E37: this is not vim", `:wq` → "nothing to
write. nowhere to quit to.", the vim trial's buffer lines, "references :P".
the rule of restraint still applies: one wink per page, deadpan delivery,
never explain the joke.
