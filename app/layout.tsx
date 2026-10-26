import type { Metadata } from "next";
import "./globals.css";

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

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Kato Samuel Portfolio",
    title: "Kato Samuel — Full Stack & Mobile Developer",
    description:
      "Building production-grade web and mobile applications from Kampala, Uganda. Next.js, Laravel, Flutter, Docker.",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Kato Samuel — Full Stack & Mobile Developer",
    description:
      "Building production-grade web and mobile applications from Kampala, Uganda.",
  },

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
    <html lang="en" className="dark font-sans" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased selection:bg-orange-500/30 selection:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
