import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/Analytics";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://needradar.net";
const brandName = "NeedRadar";

export const metadata: Metadata = {
  title: `${brandName} — Stop Guessing What Users Want. AI Mines It From Reviews.`,
  description:
    "NeedRadar uses AI to mine app reviews from App Store, Google Play, and Chinese app stores. Discover what users really want, ranked by ROI score.",
  keywords: [
    "app review analysis",
    "user needs discovery",
    "product management",
    "AI review mining",
    "feature prioritization",
  ],
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  openGraph: {
    title: `${brandName} — AI-Powered App Review Need Mining`,
    description:
      "Stop guessing what to build next. Mine real user needs from millions of app reviews.",
    type: "website",
    url: siteUrl,
    siteName: brandName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandName} — AI Mines User Needs From Reviews`,
    description:
      "Discover what users really want. Ranked by impact. Prioritized by ROI.",
  },
};

function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: brandName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: brandName,
    url: siteUrl,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-screen bg-black text-white font-sans">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
