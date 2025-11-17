import { images } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

export default function Saved() {
	const [saved, setSaved] = useState(true);

	const savedRoutes = [
		{
			nickname: "Home",
			saved_id: "1",
			destination_address: "Pokhara, Nepal",
			destination_latitude: "28.209583",
			destination_longitude: "83.985567",
			ride_time: 391,
			user_id: "1",
		},
		{
			nickname: "College",
			saved_id: "2",
			destination_address: "Pune, Maharashtra, India",
			destination_latitude: "18.520430",
			destination_longitude: "73.856744",
			ride_time: 491,
			user_id: "1",
		},
		{
			nickname: "Work",
			saved_id: "3",
			destination_address: "Rijeka, Croatia",
			destination_latitude: "45.327063",
			destination_longitude: "14.442176",
			ride_time: 124,
			user_id: "1",
		},
		{
			nickname: "Vacation Trip",
			saved_id: "4",
			destination_address: "Osaka, Japan",
			destination_latitude: "34.693725",
			destination_longitude: "135.502254",
			ride_time: 159,
			user_id: "1",
		},
	];

	return (
		<SafeAreaView className="flex-1 bg-gray-100 p-3">
			<Text className="text-3xl font-lexendBold text-[#454545]">
				Your Saved Rides
			</Text>
			<Text className="text-md font-lexendRegular text-gray-500">
				You can see all your saved destinations here.
			</Text>

			{saved ? (
				<FlatList
					data={savedRoutes?.slice(0, 5)}
					keyExtractor={(item) => item.saved_id}
					renderItem={({ item }) => (
						<View className="flex-row bg-white rounded-2xl p-4 mb-3 shadow-sm items-center">
							<Image
								source={{
									uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${item.destination_longitude},${item.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
								}}
								style={{ width: 80, height: 90, borderRadius: 8 }}
							/>

							<View className="ml-3 flex-1">
								<Text className="font-lexendBold text-lg text-[#454545]">
									{item.destination_address}
								</Text>
								<Text className="font-lexendRegular text-gray-500 mt-1">
									{item.ride_time} mins
								</Text>
								<Text className="font-lexendExtraLight text-gray-500 mt-1">
									{item.nickname}
								</Text>
							</View>
							<TouchableOpacity
								className="absolute bottom-5 right-5"
								onPress={() => {
									console.log("Delete pressed");
								}}
							>
								<MaterialIcons name="delete" size={16} color={"red"} />
							</TouchableOpacity>
						</View>
					)}
					className="my-3"
				/>
			) : (
				<View className="flex items-center justify-center mt-20">
					<Image
						source={images.emptyList}
						resizeMode="contain"
						className="w-40 h-40"
					/>
					<Text className="font-lexendBold text-sm text-center mb-10 mx-8 text-[#454545]">
						You don&apos;t have any saved rides yet — start adding now!
					</Text>
				</View>
			)}
		</SafeAreaView>
	);
}
