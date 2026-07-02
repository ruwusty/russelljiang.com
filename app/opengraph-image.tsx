import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "russell jiang — terminal-styled personal site";

// ascii-only inside the card: satori renders missing glyphs as tofu, so no
// box-drawing or kaomoji here. the frame is css borders, like the real site.
const MONO_URL =
  "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-Regular.ttf";

export default async function OpengraphImage() {
  const mono = await fetch(MONO_URL)
    .then((res) => (res.ok ? res.arrayBuffer() : null))
    .catch(() => null);

  const fontFamily = mono ? "JetBrains Mono" : "monospace";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#faf8f3",
          padding: 56,
          fontFamily,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: "3px solid #e4dfd1",
            position: "relative",
          }}
        >
          {/* wordmark sitting on the frame border, like the site */}
          <div
            style={{
              position: "absolute",
              top: -22,
              left: 48,
              background: "#faf8f3",
              padding: "0 20px",
              fontSize: 30,
              letterSpacing: "0.2em",
              color: "#3b3a36",
            }}
          >
            russell jiang
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 96,
            }}
          >
            <div
              style={{
                fontSize: 76,
                letterSpacing: "0.12em",
                color: "#3b3a36",
              }}
            >
              russell jiang
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 28,
                color: "#8e8a7e",
              }}
            >
              <span style={{ color: "#6f8f6a", marginRight: 18 }}>&gt;</span>
              data science student · sydney
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 12,
                fontSize: 28,
                color: "#c9c4b4",
              }}
            >
              <span style={{ color: "#6f8f6a", marginRight: 18 }}>&gt;</span>
              russelljiang.com
              <span
                style={{
                  width: 16,
                  height: 34,
                  background: "#6f8f6a",
                  marginLeft: 10,
                }}
              />
            </div>
          </div>

          {/* statusbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "3px solid #e4dfd1",
              padding: "16px 32px",
              fontSize: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  background: "#6f8f6a",
                  color: "#faf8f3",
                  padding: "2px 14px",
                }}
              >
                normal
              </span>
              <span style={{ color: "#c9c4b4", marginLeft: 20 }}>
                j/k move · : for cmd
              </span>
            </div>
            <span style={{ color: "#c9c4b4" }}>(c) 2026 · utf-8</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: mono
        ? [{ name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const }]
        : undefined,
    }
  );
}
