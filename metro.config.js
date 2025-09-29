const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for Supabase Realtime + WebSocket packages in RN
config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	crypto: require.resolve("react-native-crypto"),
	stream: require.resolve("stream-browserify"),
	buffer: require.resolve("buffer"),
	events: require.resolve("events/"),
};

module.exports = withNativeWind(config, { input: "./app/global.css" });
