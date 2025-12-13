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
  title: "Mirage | Generative UI",
  description: "Sketch it. Build it. Run it. An offline, privacy-first generative UI engine.",
  openGraph: {
    title: "Mirage | Generative UI",
    description: "Sketch it. Build it. Run it. An offline, privacy-first generative UI engine.",
    type: "website",
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
