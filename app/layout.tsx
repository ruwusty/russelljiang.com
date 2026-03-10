import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Russell Jiang",
  description: "Data Science @ UNSW | Tutor | Musician",
  metadataBase: new URL("https://russelljiang.com"),
  openGraph: {
    title: "Russell Jiang",
    description: "Data Science @ UNSW | Tutor | Musician",
    url: "https://russelljiang.com",
    siteName: "Russell Jiang",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Russell Jiang",
    description: "Data Science @ UNSW | Tutor | Musician",
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
      <body
        className="font-[var(--font-inter)] bg-[#0a0a0a] text-[#ededed] antialiased"
        style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
