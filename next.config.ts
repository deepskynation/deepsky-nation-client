import type { NextConfig } from "next";

const allowedDevOrigins = (
  process.env.ALLOWED_DEV_ORIGINS ?? "192.168.*,10.*"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow LAN IP access in dev (Next.js blocks cross-origin /_next/* by default).
  allowedDevOrigins,
  async redirects() {
    return [
      {
        source: "/user/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
