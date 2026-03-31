import { account } from "@/lib/appwrite";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, View } from "react-native";

export default function OAuthCallback() {
	useEffect(() => {
		const checkSession = async () => {
			try {
				// add small delay (fixes race condition)
				await new Promise((res) => setTimeout(res, 500));

				const user = await account.get();
				console.log("User:", user);

				router.replace("/home");
			} catch (err) {
				console.log("Session error:", err);
			}
		};

		checkSession();
	}, []);

	return (
		<View className="flex-1 items-center justify-center">
			<Image
				source={{
					uri: "../../assets/images/callback-loader.gif",
					height: 200,
					width: 200,
				}}
			/>
		</View>
	);
}
