import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import MapComponent from "@/components/MapComponent";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NearbyDriver = {
	id: string;
	seatStatus: "AVAILABLE" | "FULL";
};

export default function Home() {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["40%", "85%"], []);
	const insets = useSafeAreaInsets();

	const [destination, setDestination] = useState<Destination | null>(null);
	const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
	const navigation = useNavigation<any>();
	const { lat, lng, name, address } = useLocalSearchParams();

	useEffect(() => {
		if (lat && lng) {
			const parsedLat = parseFloat(lat as string);
			const parsedLng = parseFloat(lng as string);

			if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
				setDestination({
					latitude: parsedLat,
					longitude: parsedLng,
					name: (name as string) || "Saved Location",
					address: (address as string) || "",
				});
			}
		}
	}, [lat, lng]);

	return (
		<View style={{ flex: 1 }}>
			{/* MAP */}
			<MapComponent
				radiusKm={2}
				onDriversChange={setNearbyDrivers}
				destination={
					destination
						? {
								latitude: destination.latitude,
								longitude: destination.longitude,
								name: destination.name,
							}
						: undefined
				}
			/>

			{/* SEARCH */}
			<View
				style={{
					position: "absolute",
					top: insets.top + 12,
					left: 12,
					right: 12,
				}}
			>
				<DestSearchBar onPlaceSelected={setDestination} />
			</View>

			{/* BOTTOM SHEET */}
			<BottomSheet
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				enablePanDownToClose={false}
			>
				<BottomSheetView style={{ flex: 1, padding: 16 }}>
					<Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
						Drivers Nearby
					</Text>

					{nearbyDrivers.length === 0 && (
						<Text style={{ color: "#666" }}>No drivers nearby</Text>
					)}

					{nearbyDrivers.map((driver) => (
						<TouchableOpacity
							key={driver.id}
							style={styles.card}
							disabled={driver.seatStatus === "FULL"}
							onPress={() =>
								router.push({
									pathname: "/request-ride",
									params: { driverId: driver.id },
								})
							}
						>
							<Text style={styles.driverTitle}>
								Driver #{nearbyDrivers.indexOf(driver) + 1}
							</Text>

							<Text
								style={{
									color: driver.seatStatus === "AVAILABLE" ? "green" : "red",
								}}
							>
								{driver.seatStatus === "AVAILABLE"
									? "Seats Available"
									: "Fully Occupied"}
							</Text>
						</TouchableOpacity>
					))}

					{/* Nearby riders count (mocked for now) */}
					<View style={{ marginTop: 20 }}>
						<Text style={{ fontSize: 16 }}>👥 12 riders nearby</Text>
					</View>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
}

const styles = {
	card: {
		padding: 16,
		borderRadius: 8,
		backgroundColor: "#fff",
		marginBottom: 12,
	},
	driverTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
};
