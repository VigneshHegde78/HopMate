import CustomBottomSheet from "@/components/CustomBottomSheet";
import { Destination } from "@/components/DestinationSearchBar";
import MapComponent from "@/components/MapComponent";
import type { DriverDoc } from "@/types";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
	const insets = useSafeAreaInsets();

	const [destination, setDestination] = useState<Destination | null>(null);
	const [nearbyDrivers, setNearbyDrivers] = useState<DriverDoc[]>([]);
	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	const { lat, lng, name, address } = useLocalSearchParams();

	/**
	 * Get user location once
	 */
	useEffect(() => {
		const getLocation = async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();

			if (status !== "granted") return;

			const loc = await Location.getCurrentPositionAsync({});
			setUserLocation({
				latitude: loc.coords.latitude,
				longitude: loc.coords.longitude,
			});
		};

		getLocation();
	}, []);

	/**
	 * Handle destination from params
	 */
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
	}, [lat, lng, name, address]);

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

			{/* HEADER */}
			<View
				className="flex-row items-end absolute top-0 left-0 right-0 px-4"
				style={{ paddingTop: insets.top }}
			>
				<Text className="text-3xl font-lexendBold text-gray-700">HopMate</Text>
			</View>

			{/* BOTTOM SHEET */}
			<CustomBottomSheet drivers={nearbyDrivers} userLocation={userLocation} />
		</View>
	);
}
