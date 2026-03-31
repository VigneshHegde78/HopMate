import { UserModeProvider, useUserMode } from "@/contexts/UserModeContext";
import { account, tableDB } from "@/lib/appwrite";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { SplashScreen, Stack, router } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

function OAuthHandler() {
	const { setMode } = useUserMode();

	const getUserWithRetry = async (retries = 6) => {
		for (let i = 0; i < retries; i++) {
			try {
				return await account.get();
			} catch {
				await new Promise((res) => setTimeout(res, 700));
			}
		}
		throw new Error("Session not ready");
	};

	useEffect(() => {
		console.log("ROOT OAuth listener active");

		const sub = Linking.addEventListener("url", async ({ url }) => {
			console.log("Deep link:", url);

			if (url.includes("oauth/callback")) {
				try {
					const user = await getUserWithRetry();
					console.log("User:", user.$id);

					try {
						const profile = await tableDB.getRow({
							databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
							tableId: process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!,
							rowId: user.$id,
						});

						const role = profile.Role;
						setMode(role);

						router.replace(
							role === "RIDER"
								? "/(root)/(tabs)/home"
								: "/(root)/(tabs)/driver",
						);
					} catch {
						router.replace("/(auth)/userDetails");
					}
				} catch (err) {
					console.log("OAuth error:", err);
					router.replace("/(auth)/sign-in");
				}
			}
		});

		return () => sub.remove();
	}, []);

	return null;
}

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
		if (loaded) SplashScreen.hideAsync();
	}, [loaded]);

	if (!loaded) return null;

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<UserModeProvider>
				<OAuthHandler />
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="(root)" options={{ headerShown: false }} />
					<Stack.Screen name="(auth)" options={{ headerShown: false }} />
					<Stack.Screen
						name="oauth/callback"
						options={{ headerShown: false }}
					/>
				</Stack>
			</UserModeProvider>
		</GestureHandlerRootView>
	);
}
