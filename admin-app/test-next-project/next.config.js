/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly set the module system
  experimental: {
    esmExternals: true
  }
}

module.exports = nextConfig;
