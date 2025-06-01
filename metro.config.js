const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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

<<<<<<< HEAD
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
=======
// Don't block any files for now to allow Firebase to work

// Handle browser-only dependencies
config.resolver.extraNodeModules = {
  // Fix make-plural broken main entry
  'make-plural': path.resolve(__dirname, 'node_modules/make-plural/plurals.js')
};

// Add resolver for specific files
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle Firebase postinstall.mjs
  if (moduleName === './postinstall.mjs' || moduleName === './postinstall') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/@firebase/app/node_modules/@firebase/util/dist/postinstall.mjs'),
      type: 'sourceFile',
    };
  }

  // Handle make-plural package
  if (moduleName === 'make-plural') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/make-plural/plurals.js'),
      type: 'sourceFile',
    };
  }

  // Handle idb stub for Firebase
  if (moduleName.includes('idb/build/stub.js') || moduleName === 'idb') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/idb/build/stub.js'),
      type: 'sourceFile',
    };
  }

  // Fix React Native Firebase common module resolution issue
  if (moduleName === '../../app/lib/common/index.js/index.js') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/@react-native-firebase/app/lib/common/index.js'),
      type: 'sourceFile',
    };
  }

  // Handle React Native Firebase common module variations
  if (moduleName.includes('@react-native-firebase/app/lib/common/index.js/index.js')) {
    return {
      filePath: path.resolve(__dirname, 'node_modules/@react-native-firebase/app/lib/common/index.js'),
      type: 'sourceFile',
    };
  }

  // Let Metro handle Firebase imports naturally

  // Let Metro handle everything else
  return context.resolveRequest(context, moduleName, platform);
>>>>>>> ca3c0d8 (Describe what you just changed or added)
};

module.exports = config;