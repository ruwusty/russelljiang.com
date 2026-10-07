import { Fragment } from "react";
import { LOGOS, type LogoName } from "../lib/fetch-logos";

// a fetch logo, locked to the character grid the way a terminal locks it.
// maple mono has no flowers, stars or notes, so those come from a fallback
// font, and a browser that picks a wider one (it happens) pushes every glyph
// after it out of its column. each such symbol therefore sits in its own 1ch
// box: whatever font draws it, it keeps exactly one cell. plain ascii and the
// box/block characters maple draws itself are left as text.
const LOCKED = /[←-⇿■-◿☀-➿]/;

function cells(line: string) {
  const out: React.ReactNode[] = [];
  let run = "";
  for (const ch of line) {
    if (LOCKED.test(ch)) {
      if (run) out.push(run);
      run = "";
      out.push(
        <span key={out.length} className="cell">
          {ch}
        </span>
      );
    } else {
      run += ch;
    }
  }
  if (run) out.push(run);
  return out;
}

export function FetchArt({
  name,
  className = "",
  style,
}: {
  name: LogoName;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <pre className={`fetch-art ${className}`} style={style} aria-hidden="true">
      {LOGOS[name].map((line, i) => (
        <Fragment key={i}>
          {i > 0 && "\n"}
          {cells(line)}
        </Fragment>
      ))}
    </pre>
  );
}
