import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Business thumbnails uploaded to Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/business-logos/**",
      },
    ],
  },
};

export default nextConfig;
