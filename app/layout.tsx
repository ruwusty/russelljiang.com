import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Russell Jiang",
  url: "https://russelljiang.com",
  sameAs: [
    "https://github.com/ruwusty",
    "https://linkedin.com/in/russelljiang",
  ],
  jobTitle: "Data Science Student",
  worksFor: {
    "@type": "CollegeOrUniversity",
    name: "UNSW Sydney",
  },
  description:
    "First-year Data Science student at UNSW Sydney. One-on-one tutor across STEM and beyond. AmusA musician.",
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
  title: "Russell Jiang",
  description:
    "Data Science student at UNSW Sydney. One-on-one tutor across STEM and beyond. AmusA musician.",
  keywords: [
    "Russell Jiang",
    "UNSW",
    "Data Science",
    "tutor",
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
    title: "Russell Jiang",
    description:
      "Data Science student at UNSW Sydney. One-on-one tutor across all subjects including Science Olympiad prep. AmusA musician.",
    url: "https://russelljiang.com",
    siteName: "Russell Jiang",
    locale: "en_AU",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "Russell Jiang",
    description:
      "Data Science student at UNSW Sydney. One-on-one tutor across all subjects including Science Olympiad prep. AmusA musician.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="font-[var(--font-inter)] antialiased"
        style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif", color: "var(--text-primary)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
