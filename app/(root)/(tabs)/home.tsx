import CustomBottomSheet from "@/components/CustomBottomSheet";
import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import MapComponent from "@/components/MapComponent";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NearbyDriver = {
	id: string;
	seatStatus: "AVAILABLE" | "FULL";
};

export default function Home() {
	const insets = useSafeAreaInsets();

	const [destination, setDestination] = useState<Destination | null>(null);
	const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
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
			<CustomBottomSheet
				drivers={nearbyDrivers}
				onDriverSelect={(driverId) => {
					router.push({
						pathname: "/request-ride",
						params: { driverId },
					});
				}}
			/>
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
		fontWeight: "bold" as const,
		marginBottom: 8,
	},
};
