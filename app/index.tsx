import { account } from "@/lib/appwrite";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../app/global.css";

export default function Home() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

	const checkUser = async () => {
		try {
			const user = await account.get();
			console.log("User details:", user);
			setIsLoggedIn(true);
		} catch (error) {
			console.log("No user logged in.");
			setIsLoggedIn(false);
		}
	};

	useEffect(() => {
		checkUser();
	}, []);

	// 🔄 While checking session
	if (isLoggedIn === null) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	// ✅ Redirect AFTER check completes
	return isLoggedIn ? (
		<Redirect href="/(root)/(tabs)/home" />
	) : (
		<Redirect href="/(root)/(tabs)/home" />
	);
}
