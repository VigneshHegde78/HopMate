import React from "react";
import { View } from "react-native";
import MapView, { UrlTile } from "react-native-maps";

export default function MapComponent() {
	return (
		<View style={{ flex: 1 }}>
			<MapView
				style={{ flex: 1 }}
				initialRegion={{
					latitude: 20.5937, // India center
					longitude: 78.9629,
					latitudeDelta: 10,
					longitudeDelta: 10,
				}}
			>
				<UrlTile
					urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
					maximumZ={19}
				/>
			</MapView>
		</View>
	);
}
