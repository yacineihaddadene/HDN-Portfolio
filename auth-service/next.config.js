/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Removed rewrite - using route handler at /callback/[...path]/route.ts instead
  // The route handler is more reliable and provides better logging
}

module.exports = nextConfig

