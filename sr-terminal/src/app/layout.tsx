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
  url: "https://terminal.sreekarreddy.com",
  author: "Sreekar Reddy",
  authorUrl: "https://sreekarreddy.com",
  keywords: ["Sreekar Reddy", "Sreekar Reddy Edulapalli", "Sreekar Reddy Portfolio", "Sreekar Reddy Projects", "SR Terminal", "browser OS", "WebContainers", "WebLLM", "in-browser Node.js", "AI coding assistant", "WebGPU"],
};

// JSON-LD structured data for rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "SR Terminal",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "description": siteConfig.description,
      "url": siteConfig.url,
      "author": {
        "@type": "Person",
        "@id": "https://sreekarreddy.com/#person",
        "name": "Sreekar Reddy",
        "url": "https://sreekarreddy.com",
        "sameAs": [
          "https://linkedin.com/in/esreekarreddy",
          "https://github.com/esreekarreddy",
          "https://twitter.com/esreekarreddy"
        ]
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "In-browser Node.js 18 via WebContainers",
        "AI coding assistant via WebLLM (Phi-3)",
        "Monaco code editor with IntelliSense",
        "Multi-terminal support with XTerm.js",
        "Runs 100% client-side"
      ]
    },
    {
      "@type": "WebPage",
      "@id": siteConfig.url,
      "name": `${siteConfig.name} by Sreekar Reddy`,
      "description": siteConfig.description,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Sreekar Reddy Projects",
        "url": "https://sreekarreddy.com"
      }
    }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} by Sreekar Reddy | Local-First Web OS`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.authorUrl }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} by Sreekar Reddy`,
    description: siteConfig.description,
    siteName: `${siteConfig.name} by Sreekar Reddy`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} by Sreekar Reddy`,
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
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

