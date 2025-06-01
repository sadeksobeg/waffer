/** @type {import('next').NextConfig} */
// Simple configuration matching the working admin-app
const nextConfig = {
  reactStrictMode: true,
  // No i18n config - keep it simple like admin-app
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Add explicit rewrites to ensure routes work
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin',
      },
      {
        source: '/dashboard',
        destination: '/dashboard',
      },
    ];
  },
};

module.exports = nextConfig;
