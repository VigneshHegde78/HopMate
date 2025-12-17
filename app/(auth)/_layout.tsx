import { Stack } from "expo-router";

export default function Layout() {
	return (
		<Stack>
			<Stack.Screen name="onboarding" options={{ headerShown: false }} />
			<Stack.Screen name="sign-in" options={{ headerShown: false }} />
			<Stack.Screen name="sign-up" options={{ headerShown: false }} />
			<Stack.Screen name="terms" options={{ headerShown: false }} />
			<Stack.Screen name="privacy" options={{ headerShown: false }} />
			<Stack.Screen name="userDetails" options={{ headerShown: false }} />
		</Stack>
	);
}
