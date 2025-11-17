import { useClerk } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export const SignOutButton = () => {
	// Use `useClerk()` to access the `signOut()` function
	const { signOut } = useClerk();
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			await signOut();
			// Redirect to your desired page
			router.replace("/");
		} catch (err) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
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
