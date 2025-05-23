import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "th-i.thgim.com",
      },
      {
        protocol: "https",
        hostname:"images.indianexpress.com",
      },
      {
        protocol: "https",
        hostname:"economictimes.indiatimes.com",
      }
    ],
  },
};

export default nextConfig;
