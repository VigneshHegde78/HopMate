// sign-up.tsx
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useUserMode } from "@/contexts/UserModeContext";
import { account, signInWithGoogle, tableDB } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
	const formatDateDDMMYYYY = (date: Date) => {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	};

	const router = useRouter();
	const { setMode } = useUserMode();

	const [selectedRole, setSelectedRole] = useState<"DRIVER" | "RIDER" | null>(
		null,
	);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [isSelected, setIsSelected] = useState(false);
	const [step, setStep] = useState<"FORM" | "ROLE">("ROLE");

	// Email/Password Sign Up
	const onSignUpPress = async () => {
		if (!email || !password || !username || !confirmPassword) {
			setError("Please fill in all fields.");
			return;
		}
		if (!selectedRole) return;

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		try {
			// 1️⃣ Create Appwrite account
			const user = await account.create(
				ID.unique(),
				email.trim(),
				password,
				username.trim(),
			);

			console.log("Auth user created:", user);

			// 2️⃣ Create session FIRST
			await account.createEmailPasswordSession({
				email: email,
				password: password,
			});

			// 3️⃣ Create table row (profile)
			const res = await tableDB.createRow({
				databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
				tableId: process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!,
				rowId: user.$id, // one row per user
				data: {
					UserID: user.$id,
					Role: selectedRole,
					Gender: "",
					DateOfBirth: null,
					PhoneNo: null,
					MemberSince: formatDateDDMMYYYY(new Date()),
					Email: user.email,
					Name: user.name,
					UserName: null,
				},
				permissions: [
					`read("user:${user.$id}")`,
					`update("user:${user.$id}")`,
					`delete("user:${user.$id}")`,
				],
			});

			console.log("User profile created:", res);

			// 4️⃣ Save mode & redirect
			setMode(selectedRole);

			if (selectedRole === "RIDER") router.replace("/(root)/(tabs)/home");
			else router.replace("/(root)/(tabs)/driver");
		} catch (err: any) {
			const message = err?.message?.toLowerCase() || "";

			if (message.includes("already exists")) {
				setError("Email is already registered.");
			} else if (message.includes("invalid email")) {
				setError("Enter a valid email address.");
			} else if (message.includes("password")) {
				setError("Password must be at least 8 characters.");
			} else if (message.includes("missing")) {
				setError("Please fill all required fields.");
			} else if (message.includes("rate") || message.includes("too many")) {
				setError("Too many attempts. Try again later.");
			} else if (message.includes("permission")) {
				setError("Account setup failed. Contact support.");
			} else {
				setError("Unable to create account. Please try again.");
			}

			console.log("Sign-up error:", err);
		}
	};

	const onGoogleSignUpPress = async () => {
		try {
			console.log("Google Sign-Up button pressed");
			const user = await signInWithGoogle();
			// The deep link listener in _layout.tsx was unused, logic moved here.
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
			setError("Failed to sign up with Google.");
			console.error(err);
		}
	};

	const onContinuePress = () => {
		if (isSelected) setStep("FORM");
	};

	// Step 1: Role selection
	if (step === "ROLE") {
		return (
			<SafeAreaView className="flex-1 bg-white justify-between px-6">
				<View className="w-full space-y-6 mt-10">
					<Text className="text-3xl font-figtreeExtraBold text-gray-700 mb-12">
						Let’s get you started — choose your role!
					</Text>

					<View
						className={`${isSelected && selectedRole === "RIDER" ? "border-8 border-blue-700 rounded-3xl p-1" : ""} mb-6`}
					>
						<TouchableOpacity
							className="flex-row items-center justify-center bg-blue-700 rounded-xl shadow-md"
							onPress={() => {
								setSelectedRole("RIDER");
								setIsSelected(true);
							}}
						>
							<Image
								source={images.rider}
								resizeMode="contain"
								className="w-40 h-40"
							/>
							<Text className="text-white text-xl font-lexendSemiBold ml-4">
								Rider
							</Text>
						</TouchableOpacity>
					</View>

					<View
						className={`${isSelected && selectedRole === "DRIVER" ? "border-8 border-yellow-500 rounded-3xl p-1" : ""} mb-6`}
					>
						<TouchableOpacity
							className="flex-row items-center justify-center bg-yellow-500 rounded-xl shadow-md"
							onPress={() => {
								setSelectedRole("DRIVER");
								setIsSelected(true);
							}}
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
				</View>

				<CustomButton
					title="Continue"
					onPress={onContinuePress}
					disabled={!selectedRole}
					className="w-full mt-12 rounded-2xl py-3 mb-5 items-center"
					bgVariant="default"
				/>
			</SafeAreaView>
		);
	}

	// Step 2: Sign-up Form
	return (
		<SafeAreaView className="w-full h-full px-6 bg-gray-100">
			<View className="my-4 mt-10">
				<Text className="text-3xl font-figtreeBold">Create your account</Text>
				<Text className="text-[#858585] font-figtreeSemiBold mb-5 mt-0.5">
					Enter your details to sign up as {selectedRole}.
				</Text>
			</View>

			<InputField
				iconName="person-outline"
				placeholder="Enter Name"
				placeholderTextColor={"#858585"}
				autoCapitalize="none"
				value={username}
				onChangeText={setUsername}
			/>

			<InputField
				iconName="mail-outline"
				placeholder="your@email.com"
				placeholderTextColor="#858585"
				autoCapitalize="none"
				value={email}
				onChangeText={setEmail}
			/>

			<InputField
				iconName="lock-outline"
				placeholder="Enter password"
				placeholderTextColor="#858585"
				value={password}
				onChangeText={setPassword}
				isPassword
			/>

			<InputField
				iconName="lock-outline"
				placeholder="Confirm password"
				placeholderTextColor="#858585"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				isPassword
			/>

			<Text className="text-red-600 mt-2">{error}</Text>

			<CustomButton
				title="Sign Up"
				onPress={onSignUpPress}
				className="rounded-2xl py-3 items-center mt-4 mb-1"
				bgVariant="default"
			/>

			<View className="flex-row items-center my-4">
				<View className="flex-1 h-[1px] bg-black" />
				<Text className="mx-3 text-gray-500 font-semibold">OR</Text>
				<View className="flex-1 h-[1px] bg-black" />
			</View>

			<CustomButton
				title="Sign In"
				onPress={() => {
					router.replace("/(auth)/sign-in");
				}}
				className="rounded-2xl py-3 items-center mb-1 mt-4"
				bgVariant="default"
			/>

			<CustomButton
				title="Sign up with Google"
				IconLeft={() => (
					<Image
						source={icons.google}
						resizeMode="contain"
						className="w-6 h-6"
					/>
				)}
				onPress={onGoogleSignUpPress}
				className="border border-gray-300 mt-2 shadow-black items-center bg-blue-500"
				bgVariant="outline"
				textVariant="primary"
			/>
		</SafeAreaView>
	);
}
