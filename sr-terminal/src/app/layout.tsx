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

export const metadata: Metadata = {
  title: "SR Terminal | Local-First Web OS",
  description: "A secure, sandboxed Node.js environment running entirely in your browser using WebContainers.",
  openGraph: {
    title: "SR Terminal",
    description: "Browser-based Node.js OS with safe sandboxing.",
    siteName: "SR Terminal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SR Terminal",
    description: "Browser-based Node.js OS with safe sandboxing.",
  },
  icons: {
    icon: "/logo.png",
  }
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
