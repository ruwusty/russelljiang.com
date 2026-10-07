# russelljiang.com

a personal site that is a tui you can read in a browser. tiled panes,
reverse-video selection, box-drawing glyphs, a working command line, one
dusty wisteria accent. the window around it is allowed to be modern; what's
inside it behaves like a terminal. every piece of content is editable on the
live site, so it never needs a redeploy to change.

```
╭─ russell jiang ────────────────────────────────────────── ◐ [dark] ─╮
│ ╭─ [1] ~/site ─╮ ╭─ [3] ~/personal/overview ──────╮ ╭─ [4] outline ╮ │
│ │ 01 ▸ overview│ │ ❯ █                            │ │ ├─ intro     │ │
│ │ 02 ▸ writing │ │                                │ │ ├─ background│ │
│ │ 03 ▸ digest  │ │  ▄▀▀▀▄   # russell jiang       │ │ └─ interests │ │
│ │ 04 ▸ library │ │ █ ✿ ✿ █  data science · unsw   │ ╰──────────────╯ │
│ │ ...          │ │  ▀▄▄▄▀   ──────────────────    │                  │
│ ╰──────────────╯ │          degree   ...          │                  │
│ ╭─ [2] status ─╮ │          shell    ru.sh        │                  │
│ │ ❯ currently  │ │                                │                  │
│ │ sliderbreak▮ │ │ ## interests                   │                  │
│ ╰──────────────╯ ╰────────────────────────────────╯                  │
├─ normal ▶ ~/overview ▶  j/k · : cmd · / grep      syd 19:42 ◀ all ──┤
╰──────────────────────────────────────────────────────────────────────╯
```

## the look

- palette lives in css variables and nowhere else: cool neutral greys, a
  wisteria accent (藤), rose for the prompt and cursors (桜), and a green
  that only ever means something (online, valid). dark mode keeps the same
  two flowers.
- [maple mono](https://github.com/subframe7536/maple-font) for everything,
  ligatures on. its cursive italic is saved for the side-comment voice:
  taglines, summaries, `//` lines.
- "rj glyphs" (a renamed one-cell subset of dejavu sans mono, licence in
  `public/fonts/`) fills in the symbols maple doesn't have: ✿ ★ ♪ ☾ and
  friends, so ascii art can use them and still line up.
- the modern finish stops at the window: rounded corners, a soft shadow,
  two blurred lamps and a dot grid behind it, a powerline status bar.
  interactive things stay flat. no fades, no glows, no cards.
- headings read like markdown in a terminal: `# page`, `## section`.

## the command line is real

the prompt sits under the pane title on every page. `:` focuses it, `/`
focuses it with `grep ` already typed. tab or → accepts the ghost
completion, ↑/↓ walk your history.

| command | does |
| --- | --- |
| `ls` | list pages |
| `cat <page>` / `go <page>` | open one |
| `grep <term>` | search the writing |
| `fastfetch [logo]` | system info for *your* machine, next to one of 14 ascii logos. `-l` lists them |
| `theme [dark\|light]` | switch theme |
| `tea [min]` | a timer, for tea |
| `whoami` | introductions |
| `login` / `logout` | owner mode |
| `clear` | clear the output |

a few more aren't in `help`. vim users will find one straight away.

`j` / `k` + `enter` move through the nav.

## the site is its own cms

content lives in vercel blob, one json blob per feature, behind small api
routes. reads are public, writes are checked server-side against one site
password. log in and edit controls appear in place: textareas, a popup
editor with line numbers for the `currently` list, drag and drop for the
planner. visitors never see any of it.

| content | route |
| --- | --- |
| home bio / background / interests | `/api/home` |
| `currently` rotation | `/api/currently` |
| kaomoji slots | `/api/kaomoji` |
| library shelf | `/api/library` |
| course planner | `/api/plan` |
| amp presets | `/api/presets` |
| guestbook (public writes) | `/api/guestbook` |
| vim trial leaderboard (public writes) | `/api/vim-scores` |

the home page reads its blob on the server so the content stays in the html
for search engines. the hardcoded defaults in components are first-run seeds
and outage fallbacks, nothing more. public writes get honeypots, hashed-ip
cooldowns, length caps and validation.

## pages

- **`/writing`**: essays, written in mdx and listed as a k9s-style table.
- **`/digest`**: a daily reading list. a cron fetches about sixteen feeds
  every morning, gemini picks the dozen worth reading, and the page lays
  them out like a terminal readout.
- **`/library`**: a shelf of book spines you can pull out and rearrange.
- **`/vim`**: a vim-motions time trial with a written guide and global and
  personal leaderboards.
- **`/bonsai`**: a tree that grows in real time whether you water it or not.
- **`/guestbook`**: like the old web.
- **`/projects`**: a short list, on purpose.

## stack

next.js 15 · react 19 · tailwind 3 · vercel blob · next-themes · maple mono
via fontsource · gemini for the digest. no ui libraries, no cms, no
third-party analytics: page views are counted by the site itself, one empty
blob per view, no cookies, no raw ips.

## scripts

```sh
node scripts/backup-blobs.mjs [base-url]   # snapshot all blob content into backups/
node scripts/sync-defaults.mjs             # rewrite the in-repo fallbacks from backups/
```

---

built with a pair programmer. the models are getting smarter, so should you ■
