/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8080/Comic/api/:path*', // tránh lỗi localhost DNS
      },
    ];
  },
};

module.exports = nextConfig;
