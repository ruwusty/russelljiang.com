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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
