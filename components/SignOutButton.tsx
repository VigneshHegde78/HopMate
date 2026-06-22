import { account } from "@/lib/appwrite";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export const SignOutButton = () => {
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			await account.deleteSessions();
			router.replace("/");
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	};

	return (
		<TouchableOpacity onPress={handleSignOut}>
			<View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center">
				<MaterialIcons name="logout" size={20} color={"white"} />
			</View>
		</TouchableOpacity>
	);
};
