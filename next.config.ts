import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase', 'firebase-admin'],
  images: {
    qualities: [75, 85, 90, 100], // Add 85 to allowed qualities
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};
  /* config options here */


export default nextConfig;
