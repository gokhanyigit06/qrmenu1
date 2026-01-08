import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ppyvajojssguolwrqkzb.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'mickeys.thervz.co',
      },
    ],
  },
  reactStrictMode: true,
  compress: true,
};

export default nextConfig;
