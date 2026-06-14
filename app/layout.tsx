// app/layout.tsx (Updated for better SEO with more meta tags and structured data)
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Sora } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://eventopic.com"),
  title: "Eventopic — Event Staff, Promotions & Part-Time Jobs in the UAE",
  description:
    "Eventopic is a UAE staffing platform connecting hostesses, promoters, models and hospitality staff with events, promotions and part-time work across Dubai and the Emirates. Browse jobs or hire reliable staff.",
  keywords:
    "event staff UAE, part time jobs Dubai, promotion staff Dubai, hire promoters Dubai, hostesses Dubai, event jobs Dubai, hospitality staff, brand ambassadors, models Dubai, staffing UAE",
  openGraph: {
    title: "Eventopic — Staffing for Events, Promotions & Part-Time Work in the UAE",
    description:
      "Browse event, promotion and part-time jobs across the UAE, or hire reliable staff. A simple platform built by a small Dubai team.",
    images: ["/og-image.png"],
    type: "website",
    url: "https://eventopic.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventopic — UAE Event, Promo & Part-Time Staffing",
    description: "Find event, promotion and part-time work in the UAE — or hire vetted staff.",
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
            description: "A UAE staffing platform connecting people with event, promotion and part-time work across Dubai and the Emirates.",
            address: {
              "@type": "PostalAddress",
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