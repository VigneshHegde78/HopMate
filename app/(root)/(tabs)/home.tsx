import MapViewComponent, { MapMarker } from "@/components/MapView";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Region } from "react-native-maps";

export default function HomeScreen() {
	// ref
	const bottomSheetRef = useRef<BottomSheet>(null);

	// state
	const [currentRegion, setCurrentRegion] = useState<Region | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
	const [nearbyMarkers, setNearbyMarkers] = useState<MapMarker[]>([]);

	// variables
	const snapPoints = useMemo(() => ["50%", "70%", "90%"], []);

	const rides = useMemo(
		() => [
			{ id: "1", username: "Ava", distance: 120 },
			{ id: "2", username: "Liam", distance: 280 },
			{ id: "3", username: "Noah", distance: 430 },
			{ id: "4", username: "Mia", distance: 610 },
			{ id: "5", username: "Zoe", distance: 750 },
		],
		[]
	);

	useEffect(() => {
		// Ensure the sheet snaps after mount to the minimum (50%)
		bottomSheetRef.current?.snapToIndex(0);
	}, []);

	// Handle map region changes
	const handleRegionChange = (region: Region) => {
		setCurrentRegion(region);
		// Here you can fetch nearby rides based on the region
		// For now, we'll add some example markers near the user
		if (region) {
			const exampleMarkers: MapMarker[] = [
				{
					id: "marker-1",
					latitude: region.latitude + 0.002,
					longitude: region.longitude + 0.002,
					title: "Ride Point 1",
					description: "Available ride nearby",
					color: "#ff6b6b",
				},
				{
					id: "marker-2",
					latitude: region.latitude - 0.003,
					longitude: region.longitude + 0.001,
					title: "Ride Point 2",
					description: "Available ride nearby",
					color: "#4ecdc4",
				},
				{
					id: "marker-3",
					latitude: region.latitude + 0.001,
					longitude: region.longitude - 0.002,
					title: "Ride Point 3",
					description: "Available ride nearby",
					color: "#95e1d3",
				},
			];
			setNearbyMarkers(exampleMarkers);
		}
	};

	// Handle marker press
	const handleMarkerPress = (marker: MapMarker) => {
		Alert.alert(
			marker.title || "Ride Location",
			marker.description || "No description available",
			[{ text: "OK" }]
		);
	};

	return (
		<GestureHandlerRootView style={styles.container}>
			<View style={{ flex: 1 }}>
				<View style={StyleSheet.absoluteFillObject}>
					<MapViewComponent
						showUserLocation={true}
						markers={nearbyMarkers}
						onRegionChange={handleRegionChange}
						onMarkerPress={handleMarkerPress}
						showUserLocationCircle={false}
					/>
				</View>
				<BottomSheet
					ref={bottomSheetRef}
					index={0}
					snapPoints={snapPoints}
					style={styles.sheet}
					backgroundStyle={styles.sheetBackground}
					handleIndicatorStyle={styles.handle}
					enablePanDownToClose={false}
					onChange={(idx) => {
						if (idx < 0) bottomSheetRef.current?.snapToIndex(0);
					}}
				>
					<BottomSheetView style={styles.contentContainer}>
						<Text className="font-figtreeSemiBold text-md text-[#333]">
							Nearby Rides
						</Text>

						<View className="flex-1 h-12 border border-yellow-500 justify-center items-center rounded-xl my-2">
							<Text className="font-lexendMedium text-gray-700">Invite</Text>
						</View>

						<Text className="font-figtreeSemiBold text-md text-[#333]">
							Join Nearby
						</Text>
						<FlatList
							data={rides}
							keyExtractor={(item) => item.id}
							contentContainerStyle={styles.listContent}
							ItemSeparatorComponent={() => <View style={styles.separator} />}
							renderItem={({ item }) => (
								<View style={styles.rideItem}>
									<View className="flex-row items-center gap-4">
										<Text style={styles.rideName}>{item.username}</Text>
										<Text style={styles.rideDistance}>{item.distance} m</Text>
									</View>
									<Text>Join</Text>
								</View>
							)}
						/>
					</BottomSheetView>
				</BottomSheet>
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "grey",
	},
	contentContainer: {
		padding: 16,
		gap: 8,
	},
	listContent: {
		paddingTop: 8,
	},
	separator: {
		height: 8,
	},
	rideItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: "#f7f7f7",
		borderWidth: 1,
		borderColor: "#ececec",
	},
	rideName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	rideDistance: {
		fontSize: 14,
		color: "#555",
	},
	sheetBackground: {
		backgroundColor: "white",
		borderRadius: 20,
	},
	handle: {
		backgroundColor: "#ccc",
	},
	sheet: {
		width: "100%",
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 4,
	},
});
