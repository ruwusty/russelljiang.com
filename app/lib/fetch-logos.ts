// the neofetch logos. the home hero picks one per request (server side, so
// ssr and hydration agree) and the `fastfetch` command picks one per run.
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
    "         ▄▄▄▄▄        ",
    "       ▄▓▓▀▓▀▓▓▄      ",
    "      ▟▓▀  ▀  ▀▓▙     ",
    "     ▟▀         ▀▙    ",
    "    ▟▀           ▀▙   ",
    "   ▟▀             ▀▙  ",
    "▁▁▟▀               ▀▙▁",
  ],
  // cherry blossom, five petals each, a few already falling. (a wisteria
  // came first; every way of drawing a raceme in text read as grapes)
  sakura: [
    "                  _       ",
    "         _      _(_)_     ",
    "       _(_)_   (_)@(_)    ",
    "      (_)@(_)    (_) \\    ",
    "  _     (_)  \\        \\   ",
    "_(_)_         \\_______/   ",
    "(_)@(_)______/     '      ",
    " (_)               ,   '  ",
    "        '     ,           ",
  ],
  // after cbonsai, which grows these in a terminal
  bonsai: [
    "        &&&&&&            ",
    "    &&&&&&&&&&&&&   &&&&  ",
    "  &&&&&&&&&&&&&&&&&&&&&&& ",
    "    &&&&&\\ &&&&&/&&&&     ",
    "       &&& \\ | /  &&&     ",
    "            \\|/           ",
    "             |            ",
    "            /|            ",
    "     ━━━━━━━┷━━━━━━━      ",
    "      ╲_____________╱     ",
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
