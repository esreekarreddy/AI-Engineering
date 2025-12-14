import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "SR Terminal",
  description: "A browser-based operating system with integrated AI assistant. Runs Node.js entirely in your browser using WebContainers and WebLLM.",
  url: "https://sreekarreddy.com/projects/terminal",
  author: "Sreekar Reddy",
  authorUrl: "https://sreekarreddy.com",
  keywords: ["SR Terminal", "Sreekar Reddy", "Sreekar Edulapalli", "sreekarreddy.com", "Sreekar Reddy portfolio", "Sreekar Reddy AI", "browser OS", "WebContainers", "WebLLM", "in-browser Node.js", "AI coding assistant", "WebGPU"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Local-First Web OS`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.authorUrl }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@esreekarreddy",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: "M2DsCJTIe9s1V0OR2mGrrr_xeaYWrwTLvJ622qwIt0M",
  },
  icons: {
    icon: "/projects/terminal/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
