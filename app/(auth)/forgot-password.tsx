import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { tableDB } from "@/lib/appwrite";
import { ddmmyyyyToISO, formatDOB_DDMMYYYY, isValidDDMMYYYY, isoToDDMMYYYY } from "@/lib/utils";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

// Required Appwrite Admin Details
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID || process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const ADMIN_API_KEY = process.env.EXPO_PUBLIC_APPWRITE_ADMIN_KEY?.replace(/['"]/g, "")!; // Ensure quotes are stripped

export default function ForgotPassword() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [dob, setDob] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleResetPassword = async () => {
		if (!email.trim() || !dob || !newPassword || !confirmPassword) {
			setError("Please fill in all fields.");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			setError("Please enter a valid email address.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (newPassword.length < 8) {
			setError("New password must be at least 8 characters.");
			return;
		}

		if (!isValidDDMMYYYY(dob)) {
			setError("Please enter a valid Date of Birth (DD-MM-YYYY).");
			return;
		}

		if (!ADMIN_API_KEY) {
			Alert.alert(
				"Missing API Key",
				"You need to set EXPO_PUBLIC_APPWRITE_ADMIN_KEY in your .env file with an API key that has users.write permissions."
			);
			return;
		}

		setLoading(true);
		setError("");

		try {
			// 1. Find the user profile by Email
			const res = await tableDB.listRows({
				databaseId: DATABASE_ID,
				tableId: TABLE_ID,
				queries: [Query.equal("Email", email.trim())],
			});

			if (res.total === 0) {
				throw new Error("Account with this email does not exist.");
			}

			const userProfile = res.rows[0];

			// 2. Format the DB's DateOfBirth and compare only the DD-MM-YYYY portion
			const dbDobFormatted = isoToDDMMYYYY(userProfile.DateOfBirth);
			
			// If DOB is not set in DB, or matching fails
			if (!userProfile.DateOfBirth || dbDobFormatted !== dob) {
				throw new Error("Date of Birth does not match our records.");
			}

			// 3. Update the password using the Appwrite User REST API (Server Side simulation)
			const userId = userProfile.UserID;

			const updateResponse = await fetch(`${ENDPOINT}/users/${userId}/password`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"X-Appwrite-Project": PROJECT_ID,
					"X-Appwrite-Key": ADMIN_API_KEY,
				},
				body: JSON.stringify({
					password: newPassword,
				}),
			});

			if (!updateResponse.ok) {
				const errorData = await updateResponse.json();
				throw new Error(errorData.message || "Failed to update password.");
			}

			Alert.alert("Success", "Your password has been reset successfully. You can now sign in.");
			router.replace("/(auth)/sign-in");
		} catch (err: any) {
			console.error("Password reset error:", err);
			setError(err?.message || "Failed to reset password.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 px-6 bg-white">
			<View className="my-4 mt-6">
				<Text className="text-3xl font-figtreeBold">Reset Password</Text>
				<Text className="text-[#858585] font-figtreeSemiBold mb-5 mt-0.5">
					Verify your Date of Birth to create a new password without email verification.
				</Text>
			</View>

			<InputField
				iconName="mail-outline"
				placeholder="Email Address"
				placeholderTextColor="#858585"
				autoCapitalize="none"
				value={email}
				onChangeText={setEmail}
			/>

			<InputField
				iconName="calendar-today"
				placeholder="Date of Birth (DD-MM-YYYY)"
				placeholderTextColor="#858585"
				keyboardType="number-pad"
				maxLength={10}
				value={dob}
				onChangeText={(text) => setDob(formatDOB_DDMMYYYY(text))}
			/>

			<InputField
				iconName="lock-outline"
				placeholder="New Password"
				placeholderTextColor="#858585"
				value={newPassword}
				onChangeText={setNewPassword}
				isPassword
			/>

			<InputField
				iconName="lock-outline"
				placeholder="Confirm New Password"
				placeholderTextColor="#858585"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				isPassword
			/>

			{error ? <Text className="text-red-600 my-2">{error}</Text> : null}

			<CustomButton
				title={loading ? "Verifying..." : "Reset Password"}
				onPress={handleResetPassword}
				disabled={loading}
				className="rounded-2xl py-3 items-center mt-4 mb-2"
				bgVariant={loading ? "secondary" : "default"}
			/>

			<TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")} className="mt-4">
				<Text className="text-blue-600 text-center font-lexendSemiBold">Back to Sign In</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
}
