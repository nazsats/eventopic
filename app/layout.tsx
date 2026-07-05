// app/layout.tsx (Updated for better SEO with more meta tags and structured data)
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Sora } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import WhatsAppButton from "../components/WhatsAppButton";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

// Display — geometric, modern, luxurious (headings, hero, gradient titles).
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

// Body — refined humanist sans for readable copy.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#004643",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://eventopic.com"),
  title: "Eventopic — Event Staffing Agency in the UAE",
  description:
    "Eventopic is a UAE event staffing agency supplying professional, well-presented and reliable staff for events, exhibitions, brand activations and private gatherings — with part-time work for talent across all 7 emirates.",
  keywords:
    "event staffing agency UAE, event staff Dubai, hire hostesses Dubai, promoters Dubai, brand activation staff, exhibition staff UAE, hospitality staff Dubai, models Dubai, part time event jobs UAE, private gathering staff",
  openGraph: {
    title: "Eventopic — An Event Staffing Agency in the UAE",
    description:
      "Professional, well-presented and reliable staff for events, exhibitions, brand activations and private gatherings.",
    images: ["/og-image.png"],
    type: "website",
    url: "https://eventopic.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventopic — UAE Event Staffing Agency",
    description: "Reliable staff for events, exhibitions and activations — or find part-time event work in the UAE.",
    images: ["/og-image.png"],
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://eventopic.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable}`}>
      <head>
        {/* Enhanced Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
        {/* Structured Data for SEO */}
        <Script id="schema-struct" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Eventopic",
            url: "https://eventopic.com",
            logo: "https://eventopic.com/logo.png",
            description: "A UAE event staffing agency supplying professional, well-presented and reliable staff for events, exhibitions, brand activations and private gatherings.",
            address: {
              "@type": "PostalAddress",
              streetAddress: "International City, CBD 05, Office No. 8",
              addressLocality: "Dubai",
              addressRegion: "Dubai",
              addressCountry: "AE",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Customer Support",
              email: "info@eventopic.com",
            },
          })}
        </Script>
      </head>
      <body className={`${jakarta.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <WhatsAppButton />
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={3000}
            />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}