import { UserModeProvider } from "@/contexts/UserModeContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded] = useFonts({
		"Lexend-Light": require("../assets/fonts/Lexend-Light.ttf"),
		"Lexend-Regular": require("../assets/fonts/Lexend-Regular.ttf"),
		"Lexend-Medium": require("../assets/fonts/Lexend-Medium.ttf"),
		"Lexend-SemiBold": require("../assets/fonts/Lexend-SemiBold.ttf"),
		"Lexend-Bold": require("../assets/fonts/Lexend-Bold.ttf"),
		"Lexend-ExtraBold": require("../assets/fonts/Lexend-ExtraBold.ttf"),

		"Figtree-Light": require("../assets/fonts/Figtree-Light.ttf"),
		"Figtree-Regular": require("../assets/fonts/Figtree-Regular.ttf"),
		"Figtree-Medium": require("../assets/fonts/Figtree-Medium.ttf"),
		"Figtree-SemiBold": require("../assets/fonts/Figtree-SemiBold.ttf"),
		"Figtree-Bold": require("../assets/fonts/Figtree-Bold.ttf"),
		"Figtree-ExtraBold": require("../assets/fonts/Figtree-ExtraBold.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) return null;

	return (
		<ClerkProvider tokenCache={tokenCache}>
			<UserModeProvider>
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="(root)" options={{ headerShown: false }} />
					<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				</Stack>
			</UserModeProvider>
		</ClerkProvider>
	);
}
