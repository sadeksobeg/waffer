const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable symlinks for better monorepo support
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_enableSymlinks = true;

// Add any custom configuration here
config.resolver.sourceExts = [
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'ios.tsx',
  'android.tsx',
  'web.tsx',
];

config.resolver.assetExts = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ttf',
  'otf',
  'woff',
  'woff2',
];

// Configure the server to listen on all network interfaces
config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;