# adding an essay (mdx pipeline)

read this before adding anything to `/writing`. the pipeline exists so a new
essay is two small files, not hand-built jsx. the two oldest essays
(`vibe-coding-wont-save-you`, `the-same-shape-everywhere`) predate it and are
hand-rolled jsx — leave them as they are.

## the two files

for an essay with slug `my-essay`:

**1. `app/writing/my-essay/content.mdx`** — the prose, plain markdown:

```mdx
i spent an evening on something that was supposed to be something else.

## the first section

paragraphs. **bold** renders in ink, *italics* stay italic. section headings
(`##`) number themselves (01, 02, …) automatically — do not number them
by hand.

> blockquotes get the thin left border.

- lists get the ▸ marker

---

a `---` renders as the short 44px rule (used for part dividers).
```

**2. `app/writing/my-essay/page.tsx`** — the wrapper:

```tsx
import type { Metadata } from "next";
import { EssayLayout } from "../../components/essay-layout";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "my essay — russell jiang",
  description: "One-line description (sentence case is fine here).",
};

export default function Page() {
  return (
    <EssayLayout
      title="my essay"
      subtitle="an italic one-line subtitle"
      date="2026-07-15"
      crumb="writing/my-essay"
    >
      <Content />
    </EssayLayout>
  );
}
```

`EssayLayout` props: `byline` overrides "russell jiang" (co-authors:
`"maithili gulati & russell jiang"`); `colophon={null}` hides the
"drafted with claude" footnote, or pass a custom string.

## then wire it up (all four, every time)

1. **writing index** — add to `posts` in `app/writing/page.tsx` (newest first):
   title (Title Case), description, date, tags (2–3 lowercase words), and
   `href: "/writing/my-essay"`. `published: "personal"` unless it ran elsewhere.
2. **sitemap** — add the url to `app/sitemap.ts` (changeFrequency yearly, 0.6).
3. **CLAUDE.md** — add the route to the public routes list.
4. **verify** — `npx tsc --noEmit`, then check the page renders before pushing.

## voice + typography checklist

- lowercase prose; proper nouns keep caps (Feynman, GEB, UNSW).
- **australian english**: -ise/-isation, maths, practising, levelled.
- **no em dashes.** commas, colons, parentheses.
- curly quotes/apostrophes (’ “ ”) in prose, not straight ones.
- the final line ends with the ■ end mark, which **replaces** the full stop:
  `…and that was the point ■`
- one kaomoji max, usually none. restraint is the point.
- drafts: gate behind login like `app/writing/the-boulder-and-the-ladder`
  (client-side gate + `robots: noindex`, not listed anywhere) until published.
