import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Inter, Poppins } from 'next/font/google';
import { AuthProvider } from "../contexts/AuthContext";

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800'], 
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://eventopic.com'),
  title: "Eventopic - Event Management & Staffing Solutions in Dubai",
  description: "Eventopic – Where Ideas Become Experiences. Full-service event management, staffing, promoters, and volunteers in Dubai. Plan unforgettable events with our expert team.",
  keywords: "event management Dubai, event staffing, promoters Dubai, event volunteers, corporate events, wedding planning Dubai, part-time jobs events",
  openGraph: {
    title: "Eventopic - The Future of Showcasing Your Events",
    description: "Professional event planning and staffing services in Dubai for businesses, individuals, and government.",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}