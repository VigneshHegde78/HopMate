import DestSearchBar, { Destination } from "@/components/DestinationSearchBar";
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
				<Text style={{ marginVertical: 10 }}>
					Going to: {selectedDestination.name}
				</Text>
			)}

			{drivers.map((driver, index) => (
				<TouchableOpacity
					key={driver.id}
					style={{
						padding: 16,
						borderRadius: 12,
						backgroundColor: "#fff",
						marginBottom: 12,
					}}
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
