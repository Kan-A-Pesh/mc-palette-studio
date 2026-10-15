/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/database",
    "@repo/email",
    "@repo/env",
    "@repo/realtime",
    "@repo/server",
  ],
};

export default nextConfig;
