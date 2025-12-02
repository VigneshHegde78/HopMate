// ProfileFromScratchNativeWind.tsx
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";

import {
	Alert,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

/**
 * ProfileFromScratchNativeWind.tsx
 * - Uses NativeWind (className Tailwind syntax) instead of StyleSheet
 * - No custom components used
 * - Avatar picker (sample avatars + device library)
 * - Edit / Save / Cancel flow
 *
 * Ensure you have nativewind configured in your project.
 */

const SAMPLE_AVATARS = [
	"https://i.pravatar.cc/300?img=1",
	"https://i.pravatar.cc/300?img=2",
	"https://i.pravatar.cc/300?img=3",
	"https://i.pravatar.cc/300?img=4",
	"https://i.pravatar.cc/300?img=5",
];

type ProfileState = {
	fullName: string;
	username: string;
	email: string;
	phone: string;
	discord: string;
	dob: string;
	gender: string;
	about: string;
	avatarUri?: string | null;
	memberSince?: string | null;
};

const initialData: ProfileState = {
	fullName: "John Scott",
	username: "johnscott86",
	email: "john@example.com",
	phone: "09876543210",
	discord: "john#1234",
	dob: "1995-01-10",
	gender: "Not specified",
	about: "A travel enthusiast who loves exploring new places.",
	avatarUri: SAMPLE_AVATARS[0],
	memberSince: "2024-08-12",
};

export default function ProfileFromScratchNativeWind() {
	const [profile, setProfile] = useState<ProfileState>(initialData);
	const [editing, setEditing] = useState(false);
	const [avatarModalVisible, setAvatarModalVisible] = useState(false);
	const [tempProfile, setTempProfile] = useState<ProfileState>(initialData);
	const [showDOBPicker, setShowDOBPicker] = useState(false);

	useEffect(() => {
		// request media library permissions for expo-image-picker
		(async () => {
			if (Platform.OS !== "web") {
				const { status } =
					await ImagePicker.requestMediaLibraryPermissionsAsync();
				if (status !== "granted") {
					console.log("Image library permission not granted");
				}
			}
		})();
	}, []);

	useEffect(() => {
		if (editing) setTempProfile(profile);
	}, [editing, profile]);

	const pickImageFromDevice = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 0.8,
				allowsEditing: true,
				aspect: [1, 1],
			});

			// @ts-ignore - result has cancelled for older SDKs
			if (!result.cancelled) {
				// result.uri for older SDKs, result.assets[0].uri for newer
				// handle both shapes
				// @ts-ignore
				const uri = result.uri ?? result.assets?.[0]?.uri;
				if (uri) {
					setTempProfile((p) => ({ ...p, avatarUri: uri }));
					setAvatarModalVisible(false);
				}
			}
		} catch (err) {
			console.log("image pick error", err);
		}
	};

	const onSelectAvatar = (uri: string) => {
		setTempProfile((p) => ({ ...p, avatarUri: uri }));
		setAvatarModalVisible(false);
	};

	const onSave = () => {
		setProfile(tempProfile);
		setEditing(false);
		Alert.alert("Saved", "Profile changes saved locally.");
	};

	const onCancel = () => {
		setTempProfile(profile);
		setEditing(false);
	};

	const renderField = (
		label: string,
		value: string,
		onChange: (v: string) => void,
		placeholder?: string,
		keyboardType?: any,
		multiline = false
	) => (
		<View className="mb-3">
			<Text className="text-xs text-gray-500 mb-1 font-semibold">{label}</Text>
			{editing ? (
				<TextInput
					className={`border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white ${
						multiline ? "min-h-[84px] text-top" : ""
					}`}
					value={value}
					onChangeText={onChange}
					placeholder={placeholder}
					keyboardType={keyboardType}
					multiline={multiline}
				/>
			) : (
				<Text className="text-sm text-gray-700">{value || "Not Provided"}</Text>
			)}
		</View>
	);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-slate-50"
		>
			<ScrollView
				contentContainerStyle={{ paddingBottom: 36 }}
				className="px-5 py-4"
			>
				{/* Header */}
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-2xl font-bold text-slate-900">Profile</Text>

					<View className="flex-row items-center">
						<TouchableOpacity
							activeOpacity={0.85}
							onPress={() => {
								if (editing) onSave();
								else setEditing(true);
							}}
							className={`flex-row items-center px-3 py-2 rounded-full ${
								editing ? "bg-blue-600" : "bg-yellow-400"
							}`}
						>
							<MaterialIcons
								name={editing ? "save" : "edit"}
								size={18}
								color="#fff"
							/>
							<Text className="ml-2 text-sm font-semibold text-white">
								{editing ? "Save" : "Edit"}
							</Text>
						</TouchableOpacity>

						{editing && (
							<TouchableOpacity
								onPress={onCancel}
								className="ml-3 flex-row items-center px-3 py-2 rounded-full bg-white border border-gray-200"
							>
								<MaterialIcons name="close" size={18} color="#374151" />
								<Text className="ml-2 text-sm font-semibold text-gray-700">
									Cancel
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Avatar + name */}
				<View className="items-center mb-6">
					<TouchableOpacity
						activeOpacity={0.85}
						onPress={() => {
							if (editing) setAvatarModalVisible(true);
						}}
						className="relative"
					>
						<Image
							source={{
								uri: editing
									? tempProfile.avatarUri || ""
									: profile.avatarUri || "",
							}}
							className="w-28 h-28 rounded-full border-2 border-sky-100 bg-white"
							resizeMode="cover"
						/>
						{editing && (
							<View className="absolute -right-2 -bottom-2 bg-blue-600 w-9 h-9 rounded-full border-2 border-white items-center justify-center">
								<MaterialIcons name="camera-alt" size={16} color="#fff" />
							</View>
						)}
					</TouchableOpacity>

					<View className="mt-3 items-center">
						<Text className="text-lg font-bold text-slate-900">
							{editing ? tempProfile.fullName : profile.fullName}
						</Text>
						<Text className="text-sm text-gray-500 mt-1">
							@{editing ? tempProfile.username : profile.username}
						</Text>
					</View>
				</View>

				{/* Card */}
				<View className="bg-white rounded-xl p-4 shadow-sm">
					{renderField(
						"Full name",
						editing ? tempProfile.fullName : profile.fullName,
						(v) => setTempProfile((p) => ({ ...p, fullName: v })),
						"Your name"
					)}

					{renderField(
						"Username",
						editing ? tempProfile.username : profile.username,
						(v) => setTempProfile((p) => ({ ...p, username: v })),
						"username"
					)}

					<View className="flex-row space-x-3">
						<View className="flex-1">
							{renderField(
								"Email",
								editing ? tempProfile.email : profile.email,
								(v) => setTempProfile((p) => ({ ...p, email: v })),
								"email@example.com",
								"email-address"
							)}
						</View>

						<View className="flex-1">
							{renderField(
								"Phone",
								editing ? tempProfile.phone : profile.phone,
								(v) => setTempProfile((p) => ({ ...p, phone: v })),
								"phone number",
								"phone-pad"
							)}
						</View>
					</View>

					<View className="flex-row space-x-3">
						<View className="mb-3 mr-5">
							<Text className="text-xs text-gray-500 mb-1 font-semibold">
								DOB
							</Text>

							{editing ? (
								<>
									<TouchableOpacity
										onPress={() => setShowDOBPicker(true)}
										className="border border-gray-200 bg-white px-3 py-2 rounded-lg"
									>
										<Text className="text-sm text-gray-700">
											{tempProfile.dob
												? new Date(tempProfile.dob).toDateString()
												: "Select date"}
										</Text>
									</TouchableOpacity>

									{showDOBPicker && (
										<DateTimePicker
											value={
												tempProfile.dob ? new Date(tempProfile.dob) : new Date()
											}
											mode="date"
											display={Platform.OS === "ios" ? "spinner" : "default"}
											onChange={(event, selectedDate) => {
												if (Platform.OS === "android") setShowDOBPicker(false);

												if (selectedDate) {
													const iso = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
													setTempProfile((p) => ({ ...p, dob: iso }));
												}
											}}
										/>
									)}
								</>
							) : (
								<Text className="text-sm text-gray-700">
									{tempProfile.dob
										? new Date(tempProfile.dob).toDateString()
										: "Not Provided"}
								</Text>
							)}
						</View>

						<View className="flex-1">
							<View className="mb-3">
								<Text className="text-xs text-gray-500 mb-1 font-semibold">
									Gender
								</Text>
								{editing ? (
									<View className="flex-row items-center">
										<TouchableOpacity
											className={`px-3 py-2 rounded-full border border-gray-200 mr-2 ${
												tempProfile.gender === "Male"
													? "bg-blue-600 border-blue-600"
													: "bg-white"
											}`}
											onPress={() =>
												setTempProfile((p) => ({ ...p, gender: "Male" }))
											}
										>
											<Text
												className={`text-sm font-semibold ${
													tempProfile.gender === "Male"
														? "text-white"
														: "text-gray-700"
												}`}
											>
												Male
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											className={`px-3 py-2 rounded-full border border-gray-200 mr-2 ${
												tempProfile.gender === "Female"
													? "bg-blue-600 border-blue-600"
													: "bg-white"
											}`}
											onPress={() =>
												setTempProfile((p) => ({ ...p, gender: "Female" }))
											}
										>
											<Text
												className={`text-sm font-semibold ${
													tempProfile.gender === "Female"
														? "text-white"
														: "text-gray-700"
												}`}
											>
												Female
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											className={`px-3 py-2 rounded-full border border-gray-200 ${
												tempProfile.gender === "Not specified"
													? "bg-blue-600 border-blue-600"
													: "bg-white"
											}`}
											onPress={() =>
												setTempProfile((p) => ({
													...p,
													gender: "Not specified",
												}))
											}
										>
											<Text
												className={`text-sm font-semibold ${
													tempProfile.gender === "Not specified"
														? "text-white"
														: "text-gray-700"
												}`}
											>
												Other
											</Text>
										</TouchableOpacity>
									</View>
								) : (
									<Text className="text-sm text-gray-700">
										{profile.gender || "Not specified"}
									</Text>
								)}
							</View>
						</View>
					</View>

					{renderField(
						"About",
						editing ? tempProfile.about : profile.about,
						(v) => setTempProfile((p) => ({ ...p, about: v })),
						"A short bio",
						undefined,
						true
					)}

					<View className="mt-2">
						<Text className="text-xs text-gray-400">Member since</Text>
						<Text className="text-sm text-gray-600">
							{profile.memberSince || "-"}
						</Text>
					</View>
				</View>

				{/* Footer actions */}
				<View className="mt-5">
					<TouchableOpacity
						onPress={() =>
							Alert.alert(
								"Logout",
								"This will sign you out (connect to your auth)."
							)
						}
						className="py-3"
					>
						<Text className="text-red-500 font-bold text-center">Logout</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() =>
							Alert.alert(
								"Delete account",
								"This will delete your account. Hook to backend."
							)
						}
						className="py-3"
					>
						<Text className="text-red-500 font-bold text-center">
							Delete Account
						</Text>
					</TouchableOpacity>
				</View>

				{/* Avatar modal */}
				<Modal visible={avatarModalVisible} animationType="slide" transparent>
					<View className="flex-1 justify-end bg-black/40">
						<View className="bg-white rounded-t-2xl p-4">
							<View className="flex-row justify-between items-center mb-3">
								<Text className="text-lg font-bold">Choose avatar</Text>
								<TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
									<MaterialIcons name="close" size={20} color="#374151" />
								</TouchableOpacity>
							</View>

							<FlatList
								horizontal
								data={SAMPLE_AVATARS}
								keyExtractor={(i) => i}
								renderItem={({ item }) => (
									<TouchableOpacity
										className="mr-3"
										onPress={() => onSelectAvatar(item)}
									>
										<Image
											source={{ uri: item }}
											className="w-20 h-20 rounded-full"
										/>
									</TouchableOpacity>
								)}
								contentContainerStyle={{ paddingVertical: 8 }}
							/>

							<View className="mt-4">
								<TouchableOpacity
									onPress={pickImageFromDevice}
									className="flex-row items-center justify-center bg-blue-600 px-4 py-3 rounded-full"
								>
									<MaterialIcons name="photo-library" size={18} color="#fff" />
									<Text className="text-white ml-2 font-semibold">
										Pick from device
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => {
										setTempProfile((p) => ({ ...p, avatarUri: null }));
										setAvatarModalVisible(false);
									}}
									className="flex-row items-center justify-center bg-white border border-gray-200 px-4 py-3 rounded-full mt-3"
								>
									<MaterialIcons name="delete" size={18} color="#374151" />
									<Text className="ml-2 text-gray-700 font-semibold">
										Remove avatar
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
