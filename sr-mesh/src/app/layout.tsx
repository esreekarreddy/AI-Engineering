import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const siteConfig = {
  name: "SR Mesh",
  description: "A local-first 3D knowledge graph with in-browser AI. Visualize your thoughts in a semantic galaxy.",
  url: "https://sreekarreddy.com/projects/mesh",
  author: "Sreekar Reddy",
  authorUrl: "https://sreekarreddy.com",
  keywords: ["SR Mesh", "Sreekar Reddy", "Sreekar Edulapalli", "sreekarreddy.com", "Sreekar Reddy portfolio", "Sreekar Reddy AI", "knowledge graph", "3D visualization", "local AI", "semantic search", "browser AI", "transformers.js"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Local-First AI Knowledge Engine`,
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
    icon: "/projects/mesh/icon.svg",
    shortcut: "/projects/mesh/icon.svg",
    apple: "/projects/mesh/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
