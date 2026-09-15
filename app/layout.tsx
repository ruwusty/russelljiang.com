import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

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
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        <link rel="author" href="/humans.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* PRE-PAINT, first visit to `/` only. marks the html so globals.css
            can hide `.intro-content` before the first frame — a useEffect is
            too late, since ssr paints the html before react hydrates and the
            content would flash then vanish. no-op under reduced-motion and on
            every visit after the first. the attribute is removed by the
            prompt when its command finishes typing (command-bar.tsx). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(location.pathname==='/'&&!localStorage.getItem('rj:intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.intro='pending'}}catch(e){}})()",
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
