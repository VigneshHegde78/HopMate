import CustomBottomSheet from "@/components/CustomBottomSheet";
import { Destination } from "@/components/DestinationSearchBar";
import MapComponent from "@/components/MapComponent";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
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

			<View
				className="flex-row items-end absolute top-0 left-0 right-0 px-4"
				style={{ paddingTop: insets.top }}
			>
				<Text className="text-3xl font-lexendBold text-gray-700">HopMate</Text>
			</View>

			{/* BOTTOM SHEET */}
			<CustomBottomSheet drivers={nearbyDrivers} />
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
