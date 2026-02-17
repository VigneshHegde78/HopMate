import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type NearbyDriver = {
	id: string;
	seatStatus: "AVAILABLE" | "FULL";
};

type Props = {
	drivers: NearbyDriver[];
	onSelect: (driverId: string) => void;
	onDestinationSelected: (dest: Destination) => void;
};

export default function BrowseDriversView({
	drivers,
	onSelect,
	onDestinationSelected,
}: Props) {
	const [selectedDestination, setSelectedDestination] =
		useState<Destination | null>(null);

	return (
		<View>
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

			{drivers.map((driver, index) => (
				<TouchableOpacity
					key={driver.id}
					className="bg-[#f9fafb] p-4 mb-3 rounded-lg border border-gray-100"
					disabled={driver.seatStatus === "FULL" || !selectedDestination}
					onPress={() => onSelect(driver.id)}
				>
					<Text>Driver #{index + 1}</Text>
					<Text
						style={{
							color: driver.seatStatus === "AVAILABLE" ? "green" : "red",
						}}
					>
						{driver.seatStatus}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}
