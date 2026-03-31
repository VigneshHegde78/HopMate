// sign-in.tsx
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { useUserMode } from "@/contexts/UserModeContext";
import { account, signInWithGoogle, tableDB } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
	const router = useRouter();
	const { setMode } = useUserMode();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// Email/Password Sign In
	const onSignInPress = async () => {
		if (!email || !password) {
			setError("Please fill in all fields.");
			return;
		}

		try {
			const session = await account.createEmailPasswordSession({
				email,
				password,
			});

			const currentUser = await account.get();
			console.log("Sign-in successful:", session);

			// Fetch user profile from DB
			const profile = await tableDB.getRow({
				databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
				tableId: process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!,
				rowId: currentUser.$id,
			});

			// Get role from database
			const role = profile.Role;

			// Set context mode
			setMode(role);

			// Redirect based on stored role
			if (role === "RIDER") {
				router.replace("/(root)/(tabs)/home");
			} else {
				router.replace("/(root)/(tabs)/driver");
			}
		} catch (err: any) {
			const message = err?.message?.toLowerCase() || "";

			if (message.includes("invalid")) {
				setError("Invalid email or password.");
			} else if (message.includes("not found")) {
				setError("Account does not exist.");
			} else if (message.includes("too many")) {
				setError("Too many attempts. Try later.");
			} else {
				setError("Unable to sign in. Please try again.");
			}
		}
	};

	const onGoogleSignInPress = async () => {
		try {
			console.log("Google Sign-In button pressed");
			await signInWithGoogle();
			// The deep link listener in _layout.tsx will handle the rest.
		} catch (err) {
			setError("Failed to sign in with Google.");
			console.error(err);
		}
	};

	// Step 2: Sign-in form
	return (
		<SafeAreaView className="w-full h-full px-6 bg-gray-100">
			<View className="my-4 mt-10">
				<Text className="text-3xl font-figtreeBold">
					All set, Welcome aboard!
				</Text>
				<Text className="text-[#858585] font-figtreeSemiBold mb-5 mt-0.5">
					Enter your email and password to sign in.
				</Text>
			</View>

			<InputField
				iconName="mail-outline"
				placeholder="your@email.com"
				placeholderTextColor={"#858585"}
				autoCapitalize="none"
				value={email}
				onChangeText={setEmail}
			/>
			<InputField
				iconName="lock-outline"
				placeholder="•••••••••"
				placeholderTextColor={"#858585"}
				autoCapitalize="none"
				value={password}
				onChangeText={setPassword}
				isPassword
			/>

			<View className="flex-row justify-between items-start mt-0.5">
				<Text className="text-red-600 mb-2">{error}</Text>
				<TouchableOpacity>
					<Text className="text-blue-600 text-sm font-lexendSemiBold mb-4">
						Forgot Password?
					</Text>
				</TouchableOpacity>
			</View>

			<CustomButton
				title="Sign In"
				onPress={onSignInPress}
				className="rounded-2xl py-3 items-center mb-1"
				bgVariant="default"
			/>

			<View className="flex-row items-center my-4">
				<View className="flex-1 h-[1px] bg-black" />
				<Text className="mx-3 text-gray-500 font-semibold">OR</Text>
				<View className="flex-1 h-[1px] bg-black" />
			</View>

			<CustomButton
				title="Sign Up"
				onPress={() => {
					router.replace("/(auth)/sign-up");
				}}
				className="rounded-2xl py-3 items-center mb-1"
				bgVariant="default"
			/>

			<CustomButton
				title="Sign in with Google"
				IconLeft={() => (
					<Image
						source={icons.google}
						resizeMode="contain"
						className="w-6 h-6"
					/>
				)}
				onPress={onGoogleSignInPress}
				className="border border-gray-300 mt-2 shadow-black items-center bg-blue-500"
				bgVariant="outline"
				textVariant="primary"
			/>
		</SafeAreaView>
	);
}
