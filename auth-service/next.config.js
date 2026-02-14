/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Use /auth basePath so the service handles the /auth prefix from the ingress
  basePath: process.env.NODE_ENV === 'production' ? '/auth' : '',
  // Removed rewrite - using route handler at /callback/[...path]/route.ts instead
  // The route handler is more reliable and provides better logging
}

module.exports = nextConfig

