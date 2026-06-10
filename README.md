# russelljiang.com

a personal site in a **tui × japanese minimal** aesthetic — a single bordered
terminal pane on warm paper, with a vim statusbar that actually works.
it gradually became its own cms: every piece of content is editable on the
live site, no redeploys.

```
┌ russell jiang (´。• ᵕ •。`) ─────────────────────── [dark]
│
│  ~/personal/introduction
│
│  ❯ ls ~/site
│    01 ▸ overview
│    02 ▸ writing
│    03 ▸ guestbook
│    04 ▸ vim
│    05 ▸ projects
│
│  ❯ status     online
│  ❯ currently  overfitting to vibes▮
│
├───────────────────────────────────────────────────────────
│ normal  j/k move · enter open · : for cmd · © 2026 · utf-8
└───────────────────────────────────────────────────────────
```

## design rules

- warm paper palette (`#faf8f3`), ink/soft/faint text, one clay accent, one
  prompt green. dark mode inverts to warm near-black with the same accent.
- jetbrains mono for everything; a mincho serif for the site title and page
  headings only.
- no shadows, no border-radius, no gradients, no bold body text, no images as
  decoration. one 44px rule under each heading. lots of whitespace.
- the only animations are a blinking block cursor and a typewriter on the
  `currently` line — both respect `prefers-reduced-motion`.

## the tui is functional

- `j` / `k` + `enter` navigate the nav list.
- `:` opens command mode in the statusbar — `:go <page>`, `:theme dark`,
  `:whoami`, `:help`, `:vim`, and `:q` (try it). `:login` opens a masked
  password prompt for owner mode.
- the footer is a real vim-style statusbar: mode segment, keybind hints,
  message area that takes over the bar like vim does.

## the site is its own cms

content lives in vercel blob behind small api routes. reads are public,
writes require a password (`x-site-password` header → timing-safe check
against `SITE_PASSWORD`). when the owner logs in, edit affordances appear
in place — textareas, dropdowns, inline inputs — and changes sync with a
debounce. visitors never see any of it.

| content                          | route               | storage                 |
| -------------------------------- | ------------------- | ----------------------- |
| home bio / background / interests| `/api/home`         | `home/content.json`     |
| `currently` rotation             | `/api/currently`    | `currently/items.json`  |
| kaomoji slots (picker, 5 spots)  | `/api/kaomoji`      | `kaomoji/slots.json`    |
| course planner (drag & drop)     | `/api/plan`         | `plan/courses.json`     |
| amp presets (inline editing)     | `/api/presets`      | `presets/presets.json`  |
| guestbook (public writes)        | `/api/guestbook`    | `guestbook/entries.json`|
| vim trial leaderboard            | `/api/vim-scores`   | `vim/leaderboard.json`  |

the home page fetches its blob server-side so the content stays in the
ssr html (seo intact); the widgets fetch client-side. hardcoded defaults in
the components are first-run seeds and outage fallbacks — the blob is the
source of truth.

public writes (guestbook, leaderboard) get honeypots, per-ip cooldowns
(hashed ips only), length caps, and validation; the owner can moderate
entries in place.

## extras

- **`/vim`** — a vim-motions time trial: `h j k l w b e 0 $ gg G`, three
  difficulties with scaling buffers, hints on easy, a written guide, and
  global + personal leaderboards.
- **`/guestbook`** — like the old web. names get deterministic muted colours
  from a curated palette.
- **`/writing`** — essays, hand-rendered in the house style.
- fixed vertical 余白の美 in the right margin, because negative space is the
  point.

## stack

next.js 15 · react 19 · tailwind · vercel blob · next-themes.
no ui libraries, no cms, no analytics. first load is ~100 kb.

## running locally

```sh
npm install
echo "SITE_PASSWORD=changeme" > .env.local
# optional, for blob-backed saves: add BLOB_READ_WRITE_TOKEN from vercel
npm run dev
```

without a blob token everything renders from the in-repo defaults.

## scripts

```sh
node scripts/backup-blobs.mjs [base-url]   # snapshot all blob content → backups/
node scripts/sync-defaults.mjs             # rewrite in-repo fallbacks from backups/
```

---

built with a pair programmer. the models are getting smarter — so should you ■
