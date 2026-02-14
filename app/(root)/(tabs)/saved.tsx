import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import { images } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
	FlatList,
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

export default function Saved() {
	const [saved, setSaved] = useState(true);
	const [savedRoutes, setSavedRoutes] = useState([
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
	]);

	const [selected, setSelected] = useState<Destination | null>(null);
	const [nickname, setNickname] = useState("");

	const canSave = useMemo(
		() =>
			!!selected &&
			(nickname.trim().length > 0 || !!selected?.name || !!selected?.address),
		[nickname, selected]
	);

	const handleSave = () => {
		if (!selected) return;
		const id = Date.now().toString();
		const newItem = {
			nickname: nickname.trim() || selected.name || "Saved Location",
			saved_id: id,
			destination_address: selected.address || selected.name || "",
			destination_latitude: String(selected.latitude),
			destination_longitude: String(selected.longitude),
			ride_time: 0,
			user_id: "1",
		};
		setSavedRoutes((prev) => [newItem, ...prev]);
		setSaved(true);
		setSelected(null);
		setNickname("");
	};

	const handleDelete = (id: string) => {
		setSavedRoutes((prev) => {
			const next = prev.filter((r) => r.saved_id !== id);
			if (next.length === 0) setSaved(false);
			return next;
		});
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-100 p-3">
			<Text className="text-3xl font-lexendBold text-[#454545]">
				Your Saved Rides
			</Text>
			<Text className="text-md font-lexendRegular text-gray-500">
				You can see all your saved destinations here.
			</Text>

			{/* Geoapify Search + Save */}
			<View className="mt-4">
				<DestSearchBar
					onPlaceSelected={(d) => {
						setSelected(d);
					}}
				/>
				{selected ? (
					<View className="mt-3 bg-white rounded-2xl p-4">
						<Text className="font-lexendBold text-[#454545]">
							Selected Destination
						</Text>
						<Text className="font-lexendRegular text-gray-600">
							{selected.name || "Location"}
						</Text>
						{selected.address ? (
							<Text className="font-lexendExtraLight text-gray-500 mt-1">
								{selected.address}
							</Text>
						) : null}
						<View className="mt-3">
							<Text className="font-lexendRegular text-[#454545] mb-1">
								Nickname (optional)
							</Text>
							<View className="flex-row items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
								<MaterialIcons name="label" size={18} color="#666" />
								<TextInput
									value={nickname}
									onChangeText={setNickname}
									placeholder="e.g., Home, Office"
									placeholderTextColor="#999"
									style={{ flex: 1, fontSize: 16 }}
								/>
							</View>
						</View>
						<TouchableOpacity
							className={`mt-3 px-4 py-3 rounded-xl ${canSave ? "bg-[#fbc02b]" : "bg-gray-300"}`}
							onPress={handleSave}
							disabled={!canSave}
						>
							<View className="flex-row items-center justify-center gap-2">
								<MaterialIcons name="bookmark-add" size={18} color="#fff" />
								<Text className="text-white font-lexendBold">Save Ride</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							className="mt-2 px-4 py-3 rounded-xl bg-red-500"
							onPress={() => {
								setSelected(null);
								setNickname("");
							}}
						>
							<View className="flex-row items-center justify-center gap-2">
								<MaterialIcons name="cancel" size={18} color="#fff" />
								<Text className="text-white font-lexendBold">Cancel</Text>
							</View>
						</TouchableOpacity>
					</View>
				) : null}
			</View>

			{saved ? (
				<FlatList
					data={savedRoutes?.slice(0, 20)}
					keyExtractor={(item) => item.saved_id}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() =>
								router.push({
									pathname: "/(root)/(tabs)/home",
									params: {
										lat: item.destination_latitude,
										lng: item.destination_longitude,
										name: item.nickname,
										address: item.destination_address,
									},
								})
							}
							className="flex-row bg-white rounded-2xl p-4 mb-3 shadow-sm items-center"
						>
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

								<Text className="font-lexendExtraLight text-gray-500 mt-1">
									{item.nickname}
								</Text>
							</View>
							<TouchableOpacity
								className="absolute bottom-5 right-5"
								onPress={() => handleDelete(item.saved_id)}
							>
								<MaterialIcons name="delete" size={16} color={"red"} />
							</TouchableOpacity>
						</TouchableOpacity>
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
