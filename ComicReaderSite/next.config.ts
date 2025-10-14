import type { NextConfig } from 'next';

console.log("🚀 Next.js config loaded - API Proxy to http://localhost:8080/Comic");

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    console.log("🔁 Rewrites activated: /api -> http://localhost:8080/Comic/api");
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/Comic/api/:path*',
      },
    ];
  },
};

export default nextConfig;
