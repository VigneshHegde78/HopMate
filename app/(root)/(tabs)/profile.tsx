import CustomButton from "@/components/CustomButton";
import ProfileFormInput from "@/components/FormInput";
import { account, tableDB } from "@/lib/appwrite";
import {
	ddmmyyyyToISO,
	formatDate,
	formatDOB_DDMMYYYY,
	isAbove18,
	isoToDDMMYYYY,
	isValidDDMMYYYY,
} from "@/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Alert,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const PROFILE_TABLE_ID =
	process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID ||
	process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID;

const Profile = () => {
	const [profile, setProfile] = useState<any>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	const profileInputs = [
		{ label: "Full Name", key: "Name" },
		{ label: "Phone Number", key: "PhoneNo" },
	];

	// Fetch profile
	const fetchProfile = async () => {
		if (!PROFILE_TABLE_ID) {
			Alert.alert("Configuration error", "Profile table is not configured.");
			setLoadingProfile(false);
			return;
		}

		try {
			const authUser = await account.get();

			const res = await tableDB.listRows({
				databaseId: DATABASE_ID,
				tableId: PROFILE_TABLE_ID,
				queries: [Query.equal("UserID", authUser.$id)], // ✅ Correct
			});

			if (res.total > 0) {
				setProfile(res.rows[0]); // Use documents array
				setProfile({
					...res.rows[0],

					DateOfBirth: isoToDDMMYYYY(res.rows[0].DateOfBirth),
				});
			} else {
				Alert.alert("Profile not found!");
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
		} finally {
			setLoadingProfile(false);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	// Save profile
	const handleSave = async () => {
		if (!PROFILE_TABLE_ID) {
			Alert.alert("Configuration error", "Profile table is not configured.");
			return;
		}

		if (!profile || !profile.$id) {
			Alert.alert("Error", "Profile not found!");
			return;
		}

		try {
			const updated = await tableDB.updateRow({
				databaseId: DATABASE_ID,
				tableId: PROFILE_TABLE_ID,
				rowId: profile.$id, // Use the actual Appwrite row id
				data: {
					Name: profile.Name || "",
					PhoneNo: profile.PhoneNo || null,
					Gender: profile.Gender || "",
					DateOfBirth: profile.DateOfBirth
						? ddmmyyyyToISO(profile.DateOfBirth)
						: null,
				},
			});

			console.log("Update response:", updated);
			Alert.alert("Success", "Profile updated successfully!");
			setIsEditing(false);
			fetchProfile();
		} catch (error) {
			console.error("Failed to update profile:", error);
			Alert.alert("Error", "Failed to update profile");
		}
	};

	if (loadingProfile) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center">
				<Text className="text-lg font-figtreeBold">Loading profile...</Text>
			</SafeAreaView>
		);
	}

	if (isEditing) {
		return (
			<SafeAreaView className="flex-1 px-5">
				<View className="flex-row items-center justify-between my-5">
					<Text className="text-3xl font-figtreeBold my-5">Edit Profile</Text>
					<CustomButton
						title="Save"
						onPress={handleSave}
						className="rounded-full items-center text-white bg-[#0286fb] pl-5"
						IconLeft={() => (
							<MaterialIcons name="save" size={20} color="white" />
						)}
					/>
				</View>

				<View className="flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 py-5 my-3 w-full">
					<View className="w-full px-5">
						<View>
							{profileInputs.map((input) => (
								<View key={input.key} className="mb-4">
									<Text className="font-figtreeSemiBold text-gray-800 mb-1">
										{input.label}
									</Text>
									{input.key === "PhoneNo" ? (
										<TextInput
											placeholder="Enter Phone Number"
											keyboardType="number-pad" // Ensures only numeric input
											value={profile?.PhoneNo || ""}
											onChangeText={(text) => {
												// Allow only numeric input
												const numericValue = text.replace(/[^0-9]/g, "");
												setProfile({ ...profile, PhoneNo: numericValue });
											}}
											className="flex w-full h-12 border border-gray-800 rounded-md"
										/>
									) : (
										<ProfileFormInput
											placeholder={input.label}
											defaultValue={profile?.[input.key] || ""}
											onChangeText={(text) =>
												setProfile({ ...profile, [input.key]: text })
											}
										/>
									)}
								</View>
							))}
						</View>

						<Text className="font-figtreeSemiBold text-gray-800 mb-1">
							Date of Birth
						</Text>
						<TextInput
							placeholder="DD-MM-YYYY"
							keyboardType="number-pad"
							maxLength={10}
							value={profile?.DateOfBirth || ""}
							onChangeText={(text) => {
								const formatted = formatDOB_DDMMYYYY(text);

								if (formatted.length === 10) {
									if (!isValidDDMMYYYY(formatted)) return;
									if (!isAbove18(formatted)) {
										Alert.alert(
											"Invalid DOB",
											"You must be at least 18 years old.",
										);
										return;
									}
								}

								setProfile({ ...profile, DateOfBirth: formatted });
							}}
							className="flex w-full h-12 border border-gray-800 rounded-md px-3"
						/>

						<Text className="font-figtreeSemiBold text-gray-800 mt-4 mb-1">
							Gender
						</Text>
						<View className="border border-gray-800 rounded-md overflow-hidden">
							<Picker
								selectedValue={profile?.Gender || ""}
								onValueChange={(value) =>
									setProfile({ ...profile, Gender: value })
								}
							>
								<Picker.Item label="Select Gender" value="" />
								<Picker.Item label="Male" value="Male" />
								<Picker.Item label="Female" value="Female" />
								<Picker.Item label="Other" value="Other" />
							</Picker>
						</View>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1">
			<ScrollView
				className="px-5"
				contentContainerStyle={{ paddingBottom: 120 }}
			>
				<Text className="text-3xl font-figtreeBold my-5">Profile</Text>

				<View>
					{/* Profile Picture Placeholder */}
					<View className="w-24 h-24 bg-gray-300 rounded-full items-center justify-center mb-3">
						<Text className="text-4xl font-figtreeBold">
							{profile?.Name?.charAt(0) || "?"}
						</Text>
					</View>
				</View>

				<Text className="text-lg font-figtreeBold mb-5">
					{profile?.Name || "No Name Found"}
				</Text>

				<CustomButton
					title="Edit Profile"
					onPress={() => setIsEditing(true)}
					className="mb-3 rounded-full text-white bg-[#fbc02b]"
					IconLeft={() => (
						<MaterialIcons name="create" size={20} color="white" />
					)}
				/>

				{/* Profile Details */}
				<View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3 mb-5">
					<Text className="font-figtreeSemiBold text-gray-800 mt-3">
						Gender
					</Text>
					<Text className="font-figtreeMedium text-gray-500 mt-1">
						{profile?.Gender || "Not Found"}
					</Text>

					<Text className="font-figtreeSemiBold text-gray-800 mt-3">DOB</Text>
					<Text className="font-figtreeMedium text-gray-500 mt-1">
						{formatDate(profile?.DateOfBirth) || "Date of Birth not Found"}
					</Text>

					<Text className="font-figtreeSemiBold text-gray-800 mt-3">
						Member since
					</Text>
					<Text className="font-figtreeMedium text-gray-500 mt-1">
						{formatDate(profile?.MemberSince)}
					</Text>

					<Text className="font-figtreeSemiBold text-gray-800 mt-3">
						Phone No.
					</Text>
					<Text className="font-figtreeMedium text-gray-500 mt-1">
						{profile?.PhoneNo || "Not Found"}
					</Text>

					<Text className="font-figtreeSemiBold text-gray-800 mt-3">Email</Text>
					<Text className="font-figtreeMedium text-gray-500 mt-1">
						{profile?.Email || "Not Found"}
					</Text>

					<TouchableOpacity
						className="mb-3 mt-3"
						onPress={async () => {
							try {
								// Try deleting the session if it exists
								await account.deleteSessions();
								console.log("User logged out successfully.");
							} catch (error: any) {
								if (error.message.includes("Session not found")) {
									console.log("No active session found, continuing logout.");
								} else {
									console.error("Logout failed:", error);
								}
							} finally {
								// Always navigate to Sign-In
								router.replace("/(auth)/sign-in");
							}
						}}
					>
						<Text className="font-figtreeBold text-red-500">Logout</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="mb-1"
						onPress={async () => {
							try {
								// Try deleting the session if it exists
								await account.deleteSessions();
								console.log("User logged out successfully.");
							} catch (error: any) {
								if (error.message.includes("Session not found")) {
									console.log("No active session found, continuing logout.");
								} else {
									console.error("Logout failed:", error);
								}
							} finally {
								// Always navigate to Sign-In
								router.replace("/(auth)/sign-in");
							}
						}}
					>
						<Text className="font-figtreeBold text-red-500">
							Delete Account
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Profile;
