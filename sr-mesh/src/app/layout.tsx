import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "SR Mesh | Local-First AI Knowledge Engine",
  description: "A graphical second brain that runs entirely in your browser using local AI and Wasm.",
  metadataBase: new URL("https://sr-mesh.vercel.app"),
  openGraph: {
    title: "SR Mesh",
    description: "Visualize your thoughts in a 3D galaxy with local AI.",
    url: "https://sr-mesh.vercel.app",
    siteName: "SR Mesh",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
