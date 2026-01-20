// app/layout.tsx (Updated for better SEO with more meta tags and structured data)
import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eventopic.com"),
  title: "Eventopic - Professional Event Staffing Solutions in Dubai | Hire Promoters, Models & Staff",
  description:
    "Leading event staffing agency in Dubai. Hire verified promoters, models, event staff, waitstaff, and hospitality professionals quickly. Trusted by top brands for premium staffing services.",
  keywords:
    "event staffing Dubai, hire promoters Dubai, event staff agency, models for hire Dubai, hospitality staffing, brand ambassadors Dubai, waitstaff Dubai, event jobs Dubai, temporary staff Dubai, professional staffing services",
  openGraph: {
    title: "Eventopic - Premium Event Staffing Platform in Dubai",
    description:
      "Connect with 2,500+ verified professionals for events. Quick hiring for promoters, models, staff in 24-48 hours. Reliable & efficient.",
    images: ["/og-image.png"],
    type: "website",
    url: "https://eventopic.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventopic - Event Staffing Experts in Dubai",
    description: "Hire top-tier event staff, promoters, and models instantly. Verified professionals for your events.",
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
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
            description: "Premier event staffing platform in Dubai connecting businesses with verified professionals.",
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
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            theme="colored"
            style={{ zIndex: 9999 }}
          />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}