// the neofetch logos. the home hero picks one per request (server side, so
// ssr and hydration agree) and the `fastfetch` command picks one per run, or
// the one you name (`fastfetch sakura`; `fastfetch -l` lists them). symbols
// like ✿ ★ ♪ come from the RJ Glyphs font (globals.css), one cell wide.
// every line of a logo is the same width; .fetch-art lights them wisteria
// into rose from the top down.

export const LOGOS = {
  rj: [
    "██████╗      ██╗",
    "██╔══██╗     ██║",
    "██████╔╝     ██║",
    "██╔══██╗██   ██║",
    "██║  ██║╚█████╔╝",
    "╚═╝  ╚═╝ ╚════╝ ",
  ],
  // 富士, which is also how you say 藤
  fuji: [
    "                 ▗▄▄▄▄▖                 ",
    "                ▗██████▖                ",
    "               ▗████████▖               ",
    "             ▗▟██▀▀██▀▀██▙▖             ",
    "           ▄▞▀ ▜▘  ▐▌  ▝▛ ▀▚▄           ",
    "        ▄▟▀▘                ▝▀▙▄        ",
    "    ▗▄▛▀▘                      ▝▀▜▄▖    ",
    "▄▄▛▀▘                              ▝▀▜▄▄",
  ],
  // cherry blossom, five petals each, a few already falling
  sakura: [
    "                  _     ",
    "         _      _(_)_   ",
    "       _(_)_   (_)@(_)  ",
    "      (_)@(_)    (_) \\  ",
    "  _     (_)  \\        \\ ",
    "_(_)_         \\_______/ ",
    "(_)@(_)______/     '    ",
    " (_)               ,   '",
    "        '     ,         ",
  ],
  // 花見: a branch of blossom bent over, petals letting go (rj glyphs font)
  hanami: [
    "━━━━━━━━━━━━╮          ",
    "  ✿❀  ✿     ╰─────╮    ",
    " ❀✿✿❀ ❀✿   ✿❀     ╰──╮ ",
    "  ✿❀   ✿  ❀✿✿❀   ✿❀  │ ",
    "        ·   ✿   ❀✿✿❀ ✿❀",
    "   ❀      ·       ✿  ❀ ",
    "       ·       ❀      ·",
  ],
  // 花火: one shell open, the next still climbing
  hanabi: [
    "          ·  ✦  ·            ",
    "      ✦  · ╲ │ ╱ ·  ✦        ",
    "     ·  ✧ · ╲│╱ · ✧  ·       ",
    "    ✦ ─ ─ ── ✺ ── ─ ─ ✦      ",
    "     ·  ✧ · ╱│╲ · ✧  ·       ",
    "      ✦  · ╱ │ ╲ ·  ✦   · ✦ ·",
    "          ·  ✦  ·        ╲│╱ ",
    "                         ─✺─ ",
    "                          ┊  ",
    "                          ┊  ",
  ],
  // 藤, racemes of flower glyphs this time, not grapes
  wisteria: [
    "━━┳━━━━━━┳━━━━━━━┳━━━━━┳━━",
    "  ┃      ┃       ┃     ┃  ",
    " ✿❀✿    ❀✿❀     ✿❀✿   ❀✿❀ ",
    " ❀✿❀    ✿❀✿     ❀✿❀   ✿❀  ",
    "  ✿❀     ❀✿      ✿❀    ✿  ",
    "  ❀      ✿       ❀     ·  ",
    "  ·      ·       ·        ",
  ],
  // after cbonsai, which grows these in a terminal
  bonsai: [
    "        &&&&&&           ",
    "    &&&&&&&&&&&&&   &&&& ",
    "  &&&&&&&&&&&&&&&&&&&&&&&",
    "    &&&&&\\ &&&&&/&&&&    ",
    "       &&& \\ | /  &&&    ",
    "            \\|/          ",
    "             |           ",
    "            /|           ",
    "     ━━━━━━━━┷━━━━━━━━   ",
    "      ╲_____________╱    ",
  ],
  torii: [
    "▄▄██████████████████▄▄",
    " ▀▀▀█▀▀▀▀▀▀▀▀▀▀▀▀█▀▀▀ ",
    "  ▄▄█▄▄▄▄▄▄▄▄▄▄▄▄█▄▄  ",
    "    █            █    ",
    "    █            █    ",
    "    █            █    ",
    "   ▟█▙          ▟█▙   ",
  ],
  moon: [
    "               ☾        ",
    "   ★      ·          ·  ",
    "      ·        ✦        ",
    " ·           ·      ★   ",
    "                        ",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "  ~ ~~   ~ ~~~   ~ ~    ",
    "     ~    ~~   ~        ",
  ],
  // an actual N(0,1), generated, not drawn
  normal: [
    "         ▄▇█▇▄         ",
    "       ▁▇█████▇▁       ",
    "      ▄█████████▄      ",
    "    ▂▆███████████▆▂    ",
    "▁▂▄▇███████████████▇▄▂▁",
    "───────────┼───────────",
    "           μ           ",
  ],
  // for the vim trial
  hjkl: [
    "╭───╮╭───╮╭───╮╭───╮",
    "│ h ││ j ││ k ││ l │",
    "╰───╯╰───╯╰───╯╰───╯",
    "  ←    ↓    ↑    →  ",
  ],
  // a terminal inside the terminal
  terminal: [
    "╭────────────────────╮",
    "│ ● ● ●              │",
    "├────────────────────┤",
    "│ ❯ fastfetch        │",
    "│ ❯ █                │",
    "│                    │",
    "╰────────────────────╯",
  ],
  // a hit circle and its approach ring, after osu!: the hit circle in half
  // blocks, the approach ring thin, in line glyphs picked by the circle's
  // direction at each cell. generated, not drawn:
  // a cell is 0.6em x 1.3em (the .fetch-art line), so hand-drawn circles
  // come out as ovals. each half-block (▀ ▄ █) is sampled against the rings
  // in em units instead
  osu: [
    "       ───────────             ",
    "     ╱──         ──╲           ",
    "   ╱                 ╲         ",
    "  ╱      ▄█▀▀▀█▄      ╲        ",
    " │     ▄█       █▄     │       ",
    " │     █    1    █     │  · · ✦",
    " │     ▀█       █▀     │       ",
    "  ╲      ▀█▄▄▄█▀      ╱        ",
    "   ╲                 ╱         ",
    "     ╲──         ──╱           ",
    "       ───────────         300 ",
  ],
  // the scan line and its notes, after cytus ii: a flick, taps, a drag chain
  // whose heads are joined by a dotted diagonal, and a hold (one head, then its trail)
  cytus: [
    "        ●             ◁◇▷    ",
    "    ◉     ·              ◉   ",
    "            ●                ",
    "              ·              ",
    "                ●            ",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━ ▲",
    "      ◉                     │",
    "      ┃           ◉         ▼",
    "      ┃                      ",
    "      ╹                      ",
  ],
} as const;

export type LogoName = keyof typeof LOGOS;

export const LOGO_NAMES = Object.keys(LOGOS) as LogoName[];

/** a random logo, never `not` (so two fetches in a row always differ). */
export function pickLogo(not?: LogoName): LogoName {
  const pool = not ? LOGO_NAMES.filter((n) => n !== not) : LOGO_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function logoText(name: LogoName): string {
  return LOGOS[name].join("\n");
}
