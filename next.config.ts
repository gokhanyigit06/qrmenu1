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
};

export default nextConfig;
