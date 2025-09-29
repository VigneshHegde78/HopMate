import CustomButton from "@/components/CustomButton";
import { useUserMode } from "@/contexts/UserModeContext";
import { formatDateString } from "@/lib/utils"; // Import the utility function
import { useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
	const { user } = useUser();
	const { mode, setMode } = useUserMode();
	const users = {
		about_me: "Explorer",
		gender: "Male",
		phone_no: "7498111406",
		created_at: "2024-08-12 05:19:20.620007",
		date_of_birth: "2005-10-20 05:19:20.620007",
	};

	return (
		<SafeAreaView className="flex-1">
			<ScrollView
				className="px-5"
				contentContainerStyle={{ paddingBottom: 120 }}
			>
				<Text className="text-2xl font-lexendBold my-5">Profile</Text>

				<View className="flex items-start justify-center my-3">
					<Image
						source={{
							uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
						}}
						style={{ width: 80, height: 80, borderRadius: 110 / 2 }}
						className=" rounded-full h-[80px] w-[80px] border-[2px] border-black shadow-sm shadow-neutral-300"
					/>
				</View>

				<Text className="text-lg font-lexendBold">
					{user?.fullName || "Michael Smith"}
				</Text>
				<Text className="text-sm font-lexendSemiBold text-gray-500 mb-5">
					{user?.username || "MichaelSmith86"}
				</Text>

				<CustomButton
					title="Edit Profile"
					onPress={() => console.log("Edit Profile Pressed")}
					className="mb-3 rounded-full text-white bg-[#fbc02b]"
					IconLeft={() => (
						<MaterialIcons name="create" size={20} color={"white"} />
					)}
				/>

				{/* Mode Switch Buttons */}
				<View className="flex-row mb-5 bg-gray-100 rounded-full p-1">
					<TouchableOpacity
						onPress={() => setMode("user")}
						className={`flex-1 py-3 px-4 rounded-full ${
							mode === "user" ? "bg-[#0286FF]" : "bg-transparent"
						}`}
					>
						<Text
							className={`text-center font-lexendSemiBold ${
								mode === "user" ? "text-white" : "text-gray-600"
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
							className={`text-center font-lexendSemiBold ${
								mode === "driver" ? "text-white" : "text-gray-600"
							}`}
						>
							Driver Mode
						</Text>
					</TouchableOpacity>
				</View>

				<View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3 mb-3">
					<View className="flex-col mb-3">
						<Text className="font-lexendSemiBold text-gray-800">About me</Text>
						{/*test */}
						<Text className="font-lexendMedium text-gray-500">
							{users?.about_me || "Not Found"}
						</Text>
					</View>
					<View className="flex-col mb-3">
						<Text className="font-lexendSemiBold text-gray-800">Gender</Text>
						{/*test */}
						<Text className="font-lexendMedium text-gray-500">
							{users?.gender || "Not Found"}
						</Text>
					</View>
					<View className="flex-col mb-3">
						<Text className="font-lexendSemiBold text-gray-800">DOB</Text>
						{/*test */}
						<Text className="font-lexendMedium text-gray-500">
							{formatDateString(users?.date_of_birth) || "Not Found"}
						</Text>
					</View>
					<View className="flex-col mb-1">
						<Text className="font-lexendSemiBold text-gray-800">
							Member since
						</Text>
						<Text className="font-lexendMedium text-gray-500">
							{formatDateString(user?.createdAt) || "Not Found"}
						</Text>
					</View>
				</View>

				<View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3 mb-5">
					<View className="flex-col mb-3">
						<Text className="font-lexendSemiBold text-gray-800">Phone No.</Text>
						{/*test */}
						<Text className="font-lexendMedium text-gray-500">
							{user?.primaryPhoneNumber?.phoneNumber ||
								users?.phone_no ||
								"Not Found"}
						</Text>
					</View>
					<View className="flex-col mb-1">
						<Text className="font-lexendSemiBold text-gray-800">Email</Text>
						<Text className="font-lexendMedium text-gray-500">
							{user?.primaryEmailAddress?.emailAddress || "Not Found"}
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Profile;
