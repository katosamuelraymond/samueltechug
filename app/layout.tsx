import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samuel Kato Raymond — Full Stack & Mobile Developer",
  description:
    "Full-stack and mobile developer based in Kampala, Uganda. Building production-grade web and mobile applications with Next.js, Laravel, Flutter, and more.",
  keywords: ["full stack developer", "mobile developer", "Uganda", "Next.js", "Flutter", "Laravel"],
  authors: [{ name: "Samuel Kato Raymond" }],
  openGraph: {
    title: "Samuel Kato Raymond — Full Stack & Mobile Developer",
    description:
      "Full-stack and mobile developer based in Kampala, Uganda. Specialising in scalable systems and end-to-end solutions.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
