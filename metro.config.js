const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Manually block resolution of node:sea by pointing it to a local empty file
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve("buffer"),
  "node:sea": require.resolve("./empty.js"),
};

module.exports = config;
