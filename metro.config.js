const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add support for resolving WebAssembly (.wasm) files used by expo-sqlite on the web
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: "./global.css" });
