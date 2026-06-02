import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const BASE_URL = "https://samueltechug.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Kato Samuel — Full Stack & Mobile Developer",
    template: "%s | Kato Samuel",
  },

  description:
    "Full-stack and mobile developer based in Kampala, Uganda. I build production-grade web apps, mobile apps, and DevOps infrastructure using Next.js, Laravel, Flutter, and Docker.",

  keywords: [
    "Kato Samuel",
    "full stack developer Uganda",
    "mobile developer Uganda",
    "Next.js developer",
    "Laravel developer",
    "Flutter developer",
    "web developer Kampala",
    "software engineer Uganda",
    "Docker DevOps",
    "React developer",
  ],

  authors: [{ name: "Kato Samuel", url: BASE_URL }],
  creator: "Kato Samuel",

  // Canonical + alternate
  alternates: {
    canonical: BASE_URL,
  },

  // Open Graph — controls how link looks when shared on WhatsApp, Facebook, LinkedIn
  // Next.js auto-picks up app/opengraph-image.tsx as the og:image — no need to specify manually
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Kato Samuel Portfolio",
    title: "Kato Samuel — Full Stack & Mobile Developer",
    description:
      "Building production-grade web and mobile applications from Kampala, Uganda. Next.js, Laravel, Flutter, Docker.",
    locale: "en_US",
  },

  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    title: "Kato Samuel — Full Stack & Mobile Developer",
    description:
      "Building production-grade web and mobile applications from Kampala, Uganda.",
  },

  // Prevent search engines from indexing admin routes
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'light' || (!t && !d)) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
