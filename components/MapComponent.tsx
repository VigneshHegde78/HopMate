import { OSMView } from "expo-osm-sdk";
import React from "react";
import { View } from "react-native";

export default function MapComponent() {
	return (
		<View className="flex-1">
			<OSMView
				style={{ flex: 1 }}
				initialCenter={{ latitude: 40.7128, longitude: -74.006 }}
				initialZoom={10}
				onMapReady={() => console.log("Map Ready!")}
			/>
		</View>
	);
}
