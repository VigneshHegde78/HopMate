import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import MapComponent, { MapController } from "@/components/MapComponent";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const mapRef = useRef<MapController>(null);
	const snapPoints = useMemo(() => ["40%", "85%"], []);
	const insets = useSafeAreaInsets();
	const [destination, setDestination] = useState<Destination | null>(null);
	const [radiusKm, setRadiusKm] = useState<number>(0.5); // 0.5km to 2km
	const [nearbyDrivers, setNearbyDrivers] = useState<
		{
			id: number;
			title: string;
			latitude: number;
			longitude: number;
			distance?: number;
		}[]
	>([]);

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
				radiusKm={radiusKm}
				onNearbyDriversChange={(drivers) => setNearbyDrivers(drivers)}
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
					<View className="mb-3">
						<Text className="font-figtreeBold text-xl mb-1">
							Nearby Drivers
						</Text>
						<Text className="font-figtreeLight text-gray-600">
							Range: {radiusKm} km
						</Text>
						<View className="flex-row mt-2 gap-2">
							{[0.5, 1.0, 1.5, 2.0].map((r) => (
								<TouchableOpacity
									key={`radius-${r}`}
									className={`px-3 py-2 rounded-md ${radiusKm === r ? "bg-black" : "bg-white"}`}
									onPress={() => setRadiusKm(r)}
								>
									<Text
										className={`${radiusKm === r ? "text-white" : "text-black"}`}
									>
										{r} km
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
					<FlatList
						data={nearbyDrivers}
						renderItem={({ item }) => (
							<TouchableOpacity className="bg-white mt-2 p-4 rounded-lg">
								<View className="flex-row justify-between">
									<Text className="font-figtreeMedium">{item.title}</Text>
									<Text className="text-gray-600">
										{(item.distance ?? 0).toFixed(2)} km
									</Text>
								</View>
							</TouchableOpacity>
						)}
						keyExtractor={(item) => item.id.toString()}
						ListEmptyComponent={
							<Text className="text-gray-600">
								No nearby drivers for this range.
							</Text>
						}
					/>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
}
