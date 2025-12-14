import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mirage | Sketch to Code AI",
  description: "Transform wireframe sketches into React components with Vision AI. Built by Sreekar Reddy.",
  keywords: [
    "Mirage",
    "Sreekar Reddy",
    "Sreekar Edulapalli",
    "sreekarreddy.com",
    "Sreekar Reddy AI",
    "Sreekar Reddy portfolio",
    "sreekar mirage",
    "sketch to code",
    "wireframe to react",
    "AI code generator",
    "vision AI",
    "generative UI",
    "React component generator",
    "Ollama",
    "tldraw"
  ],
  authors: [{ name: "Sreekar Reddy", url: "https://sreekarreddy.com" }],
  creator: "Sreekar Reddy",
  metadataBase: new URL("https://sreekarreddy.com/projects/mirage"),
  openGraph: {
    title: "Mirage | Sketch to Code AI",
    description: "Transform wireframe sketches into React components with Vision AI. Built by Sreekar Reddy.",
    url: "https://sreekarreddy.com/projects/mirage",
    siteName: "Mirage",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirage | Sketch to Code AI",
    description: "Transform wireframe sketches into React components with Vision AI.",
    creator: "@esreekarreddy",
  },
  alternates: {
    canonical: "https://sreekarreddy.com/projects/mirage",
  },
  verification: {
    google: "M2DsCJTIe9s1V0OR2mGrrr_xeaYWrwTLvJ622qwIt0M",
  },
  other: {
    "author-website": "https://sreekarreddy.com",
    "github": "https://github.com/esreekarreddy",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
