// sign-in.tsx
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useUserMode } from "@/contexts/UserModeContext";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
	const { signIn, setActive, isLoaded } = useSignIn();
	const { startSSOFlow } = useSSO();
	const router = useRouter();
	const { setMode } = useUserMode();

	const [selectedRole, setSelectedRole] = useState<"driver" | "user" | null>(
		null
	);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// Google SSO
	const onPressGoogle = useCallback(async () => {
		if (!selectedRole) return;
		try {
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: "oauth_google",
				redirectUrl: AuthSession.makeRedirectUri(),
			});
			if (createdSessionId) {
				await setActive!({ session: createdSessionId });
				// Set the selected mode in context
				setMode(selectedRole);
				router.replace("/(root)/(tabs)/home");
			}
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	}, [selectedRole, startSSOFlow, setMode, router]);

	// Email/Password Sign In
	const onSignInPress = async () => {
		if (!isLoaded || !selectedRole) return;
		try {
			const signInAttempt = await signIn.create({
				identifier: email,
				password,
			});
			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				// Set the selected mode in context
				setMode(selectedRole);
				router.replace("/(root)/(tabs)/home");
			} else {
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		} catch (err: any) {
			if (err.errors && err.errors.length > 0) setError(err.errors[0].message);
			else setError("Sign in failed. Please try again.");
		}
	};

	// Step 1: Role selection
	if (!selectedRole) {
		return (
			<SafeAreaView className="flex-1 bg-white justify-between px-6">
				<View className="w-full space-y-6 mt-10">
					<Text className="text-3xl font-figtreeExtraBold text-gray-700 mb-12">
						Hop in, but first… choose your role!
					</Text>

					<TouchableOpacity
						className="flex-row items-center justify-center bg-blue-700 rounded-2xl mb-6 shadow-md"
						onPress={() => setSelectedRole("user")}
					>
						<Image
							source={images.rider}
							resizeMode="contain"
							className="w-40 h-40"
						/>
						<Text className="text-white text-xl font-lexendSemiBold ml-4">
							User
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="flex-row items-center justify-center bg-yellow-500 rounded-2xl shadow-md"
						onPress={() => setSelectedRole("driver")}
					>
						<Text className="ml-4 text-white text-xl font-lexendSemiBold">
							Driver
						</Text>
						<Image
							source={images.driver}
							resizeMode="contain"
							className="w-40 h-40 tint-white"
						/>
					</TouchableOpacity>
				</View>

				<CustomButton
					title="Continue"
					onPress={() => {}}
					disabled={!selectedRole}
					className="w-full mt-12 rounded-2xl py-3 mb-5 items-center"
					bgVariant="default"
				/>
			</SafeAreaView>
		);
	}

	// Step 2: Sign-in form
	return (
		<SafeAreaView className="w-full h-full px-6 bg-gray-100">
			<View className="my-4 mt-10">
				<Text className="text-3xl font-figtreeBold">Welcome Back!</Text>
				<Text className="text-[#858585] font-figtreeSemiBold mb-5">
					Enter your email and password to sign in as {selectedRole}.
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

			<View className="flex-row justify-between text-start">
				<Text className="text-red-600">{error}</Text>
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
				title="Sign in with Google"
				IconLeft={() => (
					<Image
						source={icons.google}
						resizeMode="contain"
						className="w-6 h-6"
					/>
				)}
				onPress={onPressGoogle}
				className="border border-gray-300 mt-2 shadow-black items-center bg-blue-500"
				bgVariant="outline"
				textVariant="primary"
			/>

			<CustomButton
				title="Skip for now"
				onPress={() => {
					if (selectedRole) setMode(selectedRole);
					router.replace("/(root)/(tabs)/home");
				}}
				className="rounded-2xl py-3 my-3 items-center"
				bgVariant="secondary"
			/>
		</SafeAreaView>
	);
}
