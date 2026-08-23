import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  authors: [{ name: "Charles Ozebo", url: "https://www.linkedin.com/in/ozebo-charles-b88471343/" }],
  creator: "Charles Ozebo",
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/Prepcore_app_logo_design_202606131935.jpeg",
        width: 1366,
        height: 768,
        alt: "Prepcore - Nigerian exam preparation for JAMB, WAEC, and NECO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/Prepcore_app_logo_design_202606131935.jpeg"],
  },
  icons: {
    icon: [
      {
        url: "/favicons/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        url: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicons/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/favicons/favicon-48x48.png",
    apple: [
      {
        url: "/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/favicons/android-chrome-512x512.png`,
        description: siteConfig.description,
        founder: { "@id": `${siteConfig.url}/about#charles-ozebo` },
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/about#charles-ozebo`,
        name: "Charles Ozebo",
        jobTitle: "Software Engineer and Founder of Prepcore",
        url: `${siteConfig.url}/about`,
        sameAs: ["https://www.linkedin.com/in/ozebo-charles-b88471343/"],
        worksFor: { "@id": `${siteConfig.url}/#organization` },
        description: "Computer Science student and software engineer who founded Prepcore to make JAMB and WAEC preparation more accessible and effective for Nigerian students.",
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "en-NG",
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
