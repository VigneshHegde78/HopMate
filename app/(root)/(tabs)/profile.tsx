import CustomButton from "@/components/CustomButton";
import DropdownComponent from "@/components/CustomDropDown";
import ProfileFormInput from "@/components/FormInput";
import ImagePickerComponent from "@/components/ImagePicker";
import { useUserMode } from "@/contexts/UserModeContext";
import { formatDateString } from "@/lib/utils"; // Import the utility function
import { useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	Image,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
	const { user } = useUser();
	const { mode, setMode } = useUserMode();
	const users = {
		about_me: "A travel enthusiast who loves exploring new places.",
		gender: "Male",
		phone_no: "09876543210",
		created_at: "2024-08-12 05:19:20.620007",
		date_of_birth: "1995-01-10 05:19:20.620007",
	};

	const [isEditing, setIsEditing] = useState(false);

	const profileInputs = [
		{ label: "Full Name", value: user?.fullName || "" },
		{ label: "Username", value: user?.username || "" },
		{
			label: "Phone Number",
			value: users?.phone_no || "",
		},
	];

	if (isEditing) {
		return (
			<SafeAreaView className="flex-1 px-5">
				<View className="flex-row items-center justify-between my-5">
					<Text className="text-2xl font-figtreeBold my-5">Edit Profile</Text>
					<CustomButton
						title="Save"
						onPress={() => {
							setIsEditing(false);
						}}
						className="rounded-full items-center text-white bg-[#0286fb] pl-5"
						IconLeft={() => (
							<MaterialIcons name="save" size={20} color={"white"} />
						)}
					/>
				</View>

				<View className="flex items-center justify-center my-3">
					<Image
						source={{
							uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
						}}
						style={{ width: 120, height: 120, borderRadius: 120 / 2 }}
						className=" rounded-full h-[120px] w-[120px] border-[2px] border-black shadow-sm shadow-neutral-300"
					/>
					<ImagePickerComponent />
				</View>

				<View className="flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 py-5 my-3 w-full">
					<View className="w-full px-5">
						{profileInputs.map((input) => (
							<View key={input.label} className="mb-4">
								<Text className="font-figtreeSemiBold text-gray-800 mb-1">
									{input.label}
								</Text>
								<ProfileFormInput
									placeholder={input.label}
									defaultValue={input.value}
								/>
							</View>
						))}
						<Text className="font-figtreeSemiBold text-gray-800 mb-1">
							About Us
						</Text>
						<TextInput
							placeholder="Add a description about yourself"
							className="flex w-400 h-20 border border-gray-300 rounded-md"
							defaultValue={users?.date_of_birth || ""}
						/>
					</View>
					<Text className="font-figtreeSemiBold text-gray-800 mb-0.5 ml-6 mt-4">
						Gender
					</Text>
					<View className="w-48 px-5 mt-1">
						<DropdownComponent />
					</View>
				</View>
			</SafeAreaView>
		);
	} else {
		return (
			<SafeAreaView className="flex-1">
				<ScrollView
					className="px-5"
					contentContainerStyle={{ paddingBottom: 120 }}
				>
					<Text className="text-2xl font-figtreeBold my-5">Profile</Text>

					<View className="flex items-start justify-center my-3">
						<Image
							source={{
								uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
							}}
							style={{ width: 80, height: 80, borderRadius: 110 / 2 }}
							className=" rounded-full h-[80px] w-[80px] border-[2px] border-black shadow-sm shadow-neutral-300"
						/>
					</View>

					<Text className="text-lg font-figtreeBold">
						{user?.fullName || "John Scott"}
					</Text>
					<Text className="text-sm font-figtreeSemiBold text-gray-500 mb-5">
						{user?.username || "JohnScott86"}
					</Text>

					<CustomButton
						title="Edit Profile"
						onPress={() => {
							setIsEditing(true);
						}}
						className="mb-3 rounded-full text-white bg-[#fbc02b]"
						IconLeft={() => (
							<MaterialIcons name="create" size={20} color={"white"} />
						)}
					/>

					{/* Mode Switch Buttons */}
					<View className="flex-row mb-5 bg-gray-100 rounded-full p-1">
						<TouchableOpacity
							onPress={() => setMode("rider")}
							className={`flex-1 py-3 px-4 rounded-full ${
								mode === "rider" ? "bg-[#0286FF]" : "bg-transparent"
							}`}
						>
							<Text
								className={`text-center font-figtreeSemiBold ${
									mode === "rider" ? "text-white" : "text-gray-600"
								}`}
							>
								User Mode
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setMode("driver")}
							className={`flex-1 py-3 px-4 rounded-full ${
								mode === "driver" ? "bg-[#0286FF]" : "bg-transparent"
							}`}
						>
							<Text
								className={`text-center font-figtreeSemiBold ${
									mode === "driver" ? "text-white" : "text-gray-600"
								}`}
							>
								Driver Mode
							</Text>
						</TouchableOpacity>
					</View>

					<View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3 mb-3">
						<View className="flex-col mb-3">
							<Text className="font-figtreeSemiBold text-gray-800">
								About me
							</Text>
							{/*test */}
							<Text className="font-figtreeMedium text-gray-500 mt-1">
								{users?.about_me || "Not Found"}
							</Text>
						</View>
						<View className="flex-col mb-3">
							<Text className="font-figtreeSemiBold text-gray-800">Gender</Text>
							{/*test */}
							<Text className="font-figtreeMedium text-gray-500 mt-1">
								{users?.gender || "Not Found"}
							</Text>
						</View>
						<View className="flex-col mb-3">
							<Text className="font-figtreeSemiBold text-gray-800">DOB</Text>
							{/*test */}
							<Text className="font-figtreeMedium text-gray-500 mt-1">
								{formatDateString(users?.date_of_birth) || "Not Found"}
							</Text>
						</View>
						<View className="flex-col mb-1">
							<Text className="font-figtreeSemiBold text-gray-800">
								Member since
							</Text>
							<Text className="font-figtreeMedium text-gray-500 mt-1">
								{formatDateString(user?.createdAt) || "Not Found"}
							</Text>
						</View>
					</View>

					<View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3 mb-5">
						<View className="flex-col mb-3">
							<Text className="font-figtreeSemiBold text-gray-800">
								Phone No.
							</Text>
							{/*test */}
							<Text className="font-figtreeMedium text-gray-500 mt-1">
								{user?.primaryPhoneNumber?.phoneNumber ||
									users?.phone_no ||
									"Not Found"}
							</Text>
						</View>
						<View className="flex-col mb-1">
							<Text className="font-figtreeSemiBold text-gray-800">Email</Text>
							<Text className="font-figtreeMedium text-gray-500 mt-1">
								{user?.primaryEmailAddress?.emailAddress || "Not Found"}
							</Text>
						</View>
					</View>

					<View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3 mb-5">
						<TouchableOpacity
							className="mb-3"
							onPress={() => {
								router.replace("/(auth)/sign-in");
							}}
						>
							<Text className="font-figtreeBold text-red-500">Logout</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="mb-1"
							onPress={() => {
								router.replace("/(auth)/onboarding");
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
	}
};

export default Profile;
