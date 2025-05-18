const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here
config.resolver.sourceExts = [
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'ios.tsx',
  'android.tsx',
];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf'];

module.exports = config; 