import Mapbox from "@rnmapbox/maps";
import React from "react";
import { StyleSheet } from "react-native";

Mapbox.setAccessToken("<YOUR_ACCESSTOKEN>");

const MapComponent = () => {
	return <Mapbox.MapView style={styles.map} />;
};

export default MapComponent;

const styles = StyleSheet.create({
	page: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	map: {
		flex: 1,
	},
});
