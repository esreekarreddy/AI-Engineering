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

// JSON-LD structured data for rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Mirage",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "description": "Transform wireframe sketches into React components with Vision AI. Built by Sreekar Reddy.",
      "url": "https://mirage.sreekarreddy.com",
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
        "Sketch to code generation",
        "Vision AI (GPT-4o/Ollama)",
        "tldraw infinite canvas",
        "React/Tailwind code output"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://mirage.sreekarreddy.com",
      "name": "Mirage by Sreekar Reddy",
      "description": "Generative AI that transforms sketches into React components.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Sreekar Reddy Projects",
        "url": "https://sreekarreddy.com"
      }
    }
  ]
};

export const metadata: Metadata = {
  title: "Mirage by Sreekar Reddy | Sketch to Code AI",
  description: "Mirage by Sreekar Reddy - Transform wireframe sketches into React components with Vision AI.",
  keywords: [
    "Mirage",
    "Sreekar Reddy",
    "Sreekar Reddy Edulapalli",
    "Sreekar Reddy Portfolio",
    "Sreekar Reddy Projects",
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
  publisher: "Sreekar Reddy",
  metadataBase: new URL("https://mirage.sreekarreddy.com"),
  openGraph: {
    title: "Mirage by Sreekar Reddy | Sketch to Code AI",
    description: "Transform wireframe sketches into React components with Vision AI. Built by Sreekar Reddy.",
    url: "https://mirage.sreekarreddy.com",
    siteName: "Mirage by Sreekar Reddy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirage by Sreekar Reddy | Sketch to Code AI",
    description: "Transform wireframe sketches into React components with Vision AI.",
    creator: "@esreekarreddy",
  },
  alternates: {
    canonical: "https://mirage.sreekarreddy.com",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}

