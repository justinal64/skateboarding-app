const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force zustand to resolve to the CommonJS entry point
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand') {
    return context.resolveRequest(context, 'zustand/index.js', platform);
  }
  if (moduleName === 'zustand/middleware') {
    return context.resolveRequest(context, 'zustand/middleware.js', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
