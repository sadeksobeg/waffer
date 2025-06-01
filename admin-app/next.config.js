/** @type {import('next').NextConfig} */
// i18n completely disabled

const nextConfig = {
  reactStrictMode: true,
  // No i18n config here
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
}

module.exports = nextConfig