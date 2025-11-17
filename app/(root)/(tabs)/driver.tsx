import { useUserMode } from "@/contexts/UserModeContext";
import { EvilIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeDriver() {
	const [isOnline, setIsOnline] = React.useState(false);
	const { mode } = useUserMode();

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-row justify-between items-center">
				<View className="flex-row items-end">
					<Text className="text-3xl font-lexendBold text-[#454545] pl-3">
						HopMate
					</Text>
					<Text className="text-sm font-lexendMedium text-[#858585] pl-3 pb-1 capitalize">
						{mode}
					</Text>
				</View>

				<View className="flex-row items-center pr-3">
					<Text
						className={` ${isOnline ? "text-green-500" : "text-red-500"} font-lexendBold ml-2`}
					>
						●
					</Text>
					<Text
						className={` ${isOnline ? "text-green-500" : "text-red-500"} font-lexendMedium ml-1 pr-3`}
					>
						{isOnline ? "Online" : "Offline"}
					</Text>
				</View>
			</View>

			{/* Driver Status Section */}

			<View className="w-full flex-row justify-between bg-gray-100 rounded-lg p-3 pr-7 m-3">
				<Text className="text-gray-600 font-lexendMedium">Driver Status</Text>

				<Pressable
					onPress={() => setIsOnline(!isOnline)}
					className="border h-5 w-10 rounded-xl justify-center p-0.5 ml-2"
				>
					<View
						className={`h-4 w-4 rounded-xl ${
							isOnline ? "bg-green-500 self-end" : "bg-red-500 self-start"
						}`}
					/>
				</Pressable>
			</View>

			<View className="flex justify-center items-center p-5">
				<Image
					source={{
						uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:73.856744,18.520430&zoom=16&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
					}}
					className="w-full h-60 rounded-md"
					resizeMode="cover"
				/>
			</View>

			{!isOnline && (
				<View className="bottom-0 left-0 right-0">
					<EvilIcons
						name="exclamation"
						size={50}
						color="#858585"
						className="mt-5 self-center"
					/>
					<Text className="text-center text-gray-500 font-lexendMedium m-5">
						Switch to Online to start receiving ride requests and see nearby
						users.
					</Text>
				</View>
			)}
		</SafeAreaView>
	);
}
