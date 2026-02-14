/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // No basePath needed - ingress routing handles the /auth prefix
  // Middleware and Better Auth work with paths starting at /api/auth
}

module.exports = nextConfig

