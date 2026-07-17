import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.horizonnepalconstruction.com",
      },
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
