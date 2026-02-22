import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import { calculateDistance } from "@/lib/utils";
import { type DriverDoc } from "@/types";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
	drivers: DriverDoc[];
	userLocation: { latitude: number; longitude: number } | null;
	onSelect: (driverId: string) => void;
	onDestinationSelected: (dest: Destination) => void;
};

export default function BrowseDriversView({
	drivers,
	userLocation,
	onSelect,
	onDestinationSelected,
}: Props) {
	const [selectedDestination, setSelectedDestination] =
		useState<Destination | null>(null);

	const driversWithDistance = useMemo(() => {
		if (!userLocation) return drivers;

		return drivers
			.map((driver) => ({
				...driver,
				distance: calculateDistance(
					userLocation.latitude,
					userLocation.longitude,
					driver.latitude,
					driver.longitude,
				),
			}))
			.sort((a, b) => a.distance - b.distance);
	}, [drivers, userLocation]);

	return (
		<View style={{ flex: 1 }}>
			<DestSearchBar
				onPlaceSelected={(d) => {
					setSelectedDestination(d);
					onDestinationSelected(d);
				}}
			/>

			{selectedDestination && (
				<View className="flex-row items-center gap-2 p-2 mb-3 bg-gray-100 rounded-lg">
					<FontAwesome6 name="location-arrow" size={18} color="#333" />
					<Text className="font-lexend text-md">
						{selectedDestination.name}
					</Text>
				</View>
			)}

			{driversWithDistance.map((driver, index) => (
				<TouchableOpacity
					key={driver.id}
					className="bg-[#f9fafb] p-4 mb-3 rounded-lg border border-gray-100"
					disabled={driver.seatStatus === "FULL" || !selectedDestination}
					onPress={() => onSelect(driver.id)}
				>
					<Text className="font-semibold text-base">{driver.name}</Text>

					{driver.vehicleModel && (
						<>
							<Text className="text-gray-600 text-sm">
								{driver.vehicleModel}
								{driver.vehicleType && ` (${driver.vehicleType})`}
							</Text>
							{driver.plateNumber && (
								<Text className="text-gray-500 text-xs">
									📋 {driver.plateNumber}
								</Text>
							)}
						</>
					)}

					{"distance" in driver && (
						<Text className="text-gray-500 text-sm mt-1">
							📍 {(driver as any).distance.toFixed(2)} km away
						</Text>
					)}

					<Text
						style={{
							color: driver.seatStatus === "AVAILABLE" ? "green" : "red",
							marginTop: 6,
						}}
						className="font-semibold"
					>
						{driver.seatStatus}
					</Text>
				</TouchableOpacity>
			))}

			{drivers.length === 0 && (
				<View className="items-center justify-center mt-10">
					<Text className="text-gray-500">No nearby drivers found.</Text>
				</View>
			)}
		</View>
	);
}
