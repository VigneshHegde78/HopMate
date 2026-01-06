import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import MapComponent, { MapController } from "@/components/MapComponent";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const mapRef = useRef<MapController>(null);
	const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);
	const insets = useSafeAreaInsets();
	const [destination, setDestination] = useState<Destination | null>(null);
	const drivers = [
		{
			id: 1,
			first_name: "John",
			last_name: "Doe",
			left_seats: 4,
			destination_location: { latitude: 19.3036, longitude: 72.8602 },
		},
		{
			id: 2,
			first_name: "Jane",
			last_name: "Smith",
			left_seats: 3,
			destination_location: { latitude: 19.3123, longitude: 72.8715 },
		},
		{
			id: 3,
			first_name: "Mike",
			last_name: "Johnson",
			left_seats: 2,
			destination_location: { latitude: 19.315, longitude: 72.865 },
		},
		{
			id: 4,
			first_name: "Emily",
			last_name: "Davis",
			left_seats: 1,
			destination_location: { latitude: 19.32, longitude: 72.87 },
		},
		{
			id: 5,
			first_name: "David",
			last_name: "Wilson",
			left_seats: 5,
			destination_location: { latitude: 19.31, longitude: 72.88 },
		},
		// Add more driver objects as needed
	];

	return (
		<View style={{ flex: 1 }}>
			<MapComponent
				ref={mapRef}
				destination={
					destination
						? {
								latitude: destination.latitude,
								longitude: destination.longitude,
								title: destination.name,
							}
						: undefined
				}
			/>

			{/* Search overlay */}
			<View
				style={{
					position: "absolute",
					top: insets.top + 12,
					left: 12,
					right: 12,
				}}
			>
				<DestSearchBar
					onPlaceSelected={(d) => {
						setDestination(d);
						mapRef.current?.animateTo({
							latitude: d.latitude,
							longitude: d.longitude,
						});
					}}
				/>
			</View>
			<BottomSheet
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				enablePanDownToClose={false}
				backgroundStyle={{
					backgroundColor: "#f7f7f7",
				}}
			>
				<BottomSheetView className="flex-1 p-5 bg-[#f7f7f7]">
					{destination ? (
						<View className="mb-3">
							<Text className="font-figtreeMedium text-gray-700">
								Destination
							</Text>
							<Text className="font-figtreeBold text-base">
								{destination.name || "Selected place"}
							</Text>
							{destination.address ? (
								<Text className="font-figtreeLight text-gray-600">
									{destination.address}
								</Text>
							) : null}
						</View>
					) : null}
					<Text className="font-figtreeBold text-xl  mb-2">
						Available Drivers
					</Text>
					<Text className="font-figtreeLight text-gray-600 mb-3">
						Select a driver from the list below to view more details.
					</Text>
					<FlatList
						data={drivers}
						renderItem={({ item }) => (
							<TouchableOpacity className="bg-white mt-2 p-4 rounded-lg">
								<View className="flex-col">
									<View className="flex-row justify-between">
										{/* Driver Name */}

										<Text>
											{item.first_name} {item.last_name}
										</Text>

										<Text>Seats Left: {item.left_seats}</Text>
									</View>
								</View>
							</TouchableOpacity>
						)}
						keyExtractor={(item) => item.id.toString()}
					/>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
}
