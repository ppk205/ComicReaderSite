import type { NextConfig } from "next";

const securityHeaders = [
  // [SECURITY FIX] Vuln #32: baseline security headers for the frontend.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // TODO: Next.js App Router injects inline bootstrap scripts (self.__next_f.push),
    // so 'unsafe-inline' is required until we migrate to nonce-based CSP via middleware.
    // Even so, this policy still blocks third-party script sources and restricts
    // exfiltration targets via connect-src.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:8080 https://*.azurecontainerapps.io https://*.azurewebsites.net",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Produce a self-contained server build for the Docker/GHCR image
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
