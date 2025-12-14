import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const siteConfig = {
  name: "SR Mesh",
  description: "A local-first 3D knowledge graph with in-browser AI. Visualize your thoughts in a semantic galaxy.",
  url: "https://mesh.sreekarreddy.com",
  author: "Sreekar Reddy",
  authorUrl: "https://sreekarreddy.com",
  keywords: ["Sreekar Reddy", "Sreekar Reddy Edulapalli", "Sreekar Reddy Portfolio", "Sreekar Reddy Projects", "SR Mesh", "knowledge graph", "3D visualization", "local AI", "semantic search", "browser AI", "transformers.js"],
};

// JSON-LD structured data for rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": siteConfig.name,
      "applicationCategory": "ProductivityApplication",
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
        "3D knowledge graph visualization",
        "In-browser AI semantic clustering",
        "Local-first data storage",
        "Transformers.js embeddings"
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
    default: `${siteConfig.name} by Sreekar Reddy | Local-First AI Knowledge Engine`,
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

