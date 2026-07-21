import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  compiler: {
    removeConsole: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.horizonnepalconstruction.com",
      },
    ],
  },


  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
      
          {
            key: "Link",
            value: "<https://assets.horizonnepalconstruction.com>; ",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
