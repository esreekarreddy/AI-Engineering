import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "CORTEX",
  description: "AI-powered multi-agent code review council. Get expert analysis from specialized AI agents powered by Ollama Cloud.",
  url: "https://cortex.sreekarreddy.com",
  author: "Sreekar Reddy",
  authorUrl: "https://sreekarreddy.com",
  keywords: ["Sreekar Reddy", "Sreekar Reddy Edulapalli", "Sreekar Reddy Portfolio", "Sreekar Reddy Projects", "AI code review", "multi-agent", "Ollama Cloud", "code analysis", "deepseek", "qwen", "developer tools"],
};

// JSON-LD structured data for rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": siteConfig.name,
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
        "Multi-agent AI code review council",
        "Specialized AI personas (Architect, Security, Performance)",
        "Ollama Cloud integration",
        "Real-time code analysis"
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
    default: `${siteConfig.name} by Sreekar Reddy | AI Code Review Council`,
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

