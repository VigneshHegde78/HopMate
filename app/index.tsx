import { useUserMode } from "@/contexts/UserModeContext";
import { account } from "@/lib/appwrite";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Home() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
	const { mode } = useUserMode();

	const checkUser = async () => {
		try {
			await account.get();
			setIsLoggedIn(true);
		} catch {
			setIsLoggedIn(false);
		}
	};

	useEffect(() => {
		checkUser();
	}, []);

	// 🔄 Wait until both login + mode are ready
	if (isLoggedIn === null || !mode) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!isLoggedIn) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	return (
		<Redirect
			href={mode === "rider" ? "/(root)/(tabs)/home" : "/(root)/(tabs)/driver"}
		/>
	);
}
