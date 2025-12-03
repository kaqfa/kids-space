import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error - Turbopack config might be missing in types
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
