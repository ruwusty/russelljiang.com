import type { Metadata } from "next";
// maple mono (ofl, via fontsource, self-hosted in the build): the ligatures
// and the cursive italic are the point. only 400 is ever used, so only 400
// and 400 italic ship.
import "@fontsource/maple-mono/400.css";
import "@fontsource/maple-mono/400-italic.css";
import { Providers } from "./providers";
import { HitBeacon } from "./components/hit-beacon";
import "./globals.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Russell Jiang",
  url: "https://russelljiang.com",
  sameAs: ["https://linkedin.com/in/russelljiang"],
  jobTitle: "Data Science Student",
  worksFor: {
    "@type": "CollegeOrUniversity",
    name: "UNSW Sydney",
  },
  description:
    "First-year Data Science student at UNSW Sydney. AmusA musician.",
  knowsAbout: [
    "Data Science",
    "Machine Learning",
    "Mathematics",
    "Chemistry",
    "Physics",
    "Clarinet",
    "Saxophone",
    "Guitar",
  ],
};

export const metadata: Metadata = {
  title: "russell jiang",
  description:
    "Data Science student at UNSW Sydney. AmusA musician.",
  keywords: [
    "Russell Jiang",
    "UNSW",
    "Data Science",
    "STEM",
    "AmusA",
    "Sydney",
    "machine learning",
  ],
  metadataBase: new URL("https://russelljiang.com"),
  alternates: {
    canonical: "https://russelljiang.com",
  },
  openGraph: {
    title: "russell jiang",
    description:
      "Data Science student at UNSW Sydney. AmusA musician.",
    url: "https://russelljiang.com",
    siteName: "russell jiang",
    locale: "en_AU",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "russell jiang",
    description:
      "Data Science student at UNSW Sydney. AmusA musician.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="author" href="/humans.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <HitBeacon />
        </Providers>
      </body>
    </html>
  );
}
