import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar, Header } from "@/components/layout";
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
  title: "SR Nexus — MCP Agent Debugging Platform",
  description: "Advanced debugging and visualization platform for AI agents built on Model Context Protocol. Real-time decision tree visualization, synthetic environments, and time-travel debugging.",
  keywords: ["MCP", "Model Context Protocol", "AI Agent", "Debugging", "LLM", "Ollama"],
  authors: [{ name: "Sreekar Reddy", url: "https://sreekarreddy.com" }],
  openGraph: {
    title: "SR Nexus — MCP Agent Debugging Platform",
    description: "Advanced debugging and visualization platform for AI agents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <Header />
        <main className="ml-[var(--sidebar-width)] mt-[var(--header-height)] min-h-[calc(100vh-var(--header-height))]">
          {children}
        </main>
      </body>
    </html>
  );
}
