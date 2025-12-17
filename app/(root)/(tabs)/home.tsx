import MapComponent from "@/components/MapComponent";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function Home() {
	return (
		<View style={styles.container}>
			<MapComponent />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
