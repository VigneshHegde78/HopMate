import { MapView } from "@maplibre/maplibre-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function ExampleMap() {
	const styleUrl =
		"https://api.maptiler.com/maps/streets-v2/style.json?key=uDjdyhp3yDFbuNIsAb3R";
	return (
		<View style={styles.container}>
			<MapView style={styles.map} mapStyle={styleUrl} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { flex: 1 },
});
